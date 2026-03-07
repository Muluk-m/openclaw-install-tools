import { SignalingClient, type SignalingMessage } from "./signaling";

export type ConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected";

export interface TransferItem {
  id: string;
  type: "file" | "text";
  name?: string;
  size?: number;
  data?: ArrayBuffer;
  text?: string;
  progress?: number;
  direction: "send" | "receive";
}

type StateHandler = (state: ConnectionState) => void;
type DataHandler = (data: TransferItem) => void;

const CHUNK_SIZE = 16384; // 16KB chunks

export class WebRTCManager {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private signaling: SignalingClient;
  private stateHandlers: Set<StateHandler> = new Set();
  private dataHandlers: Set<DataHandler> = new Set();
  private receiveBuffer: ArrayBuffer[] = [];
  private receiveMetadata: { name: string; size: number; id: string } | null =
    null;
  private _state: ConnectionState = "idle";
  peerId: string = "";

  constructor() {
    this.signaling = new SignalingClient();
  }

  get state() {
    return this._state;
  }

  private setState(state: ConnectionState) {
    this._state = state;
    this.stateHandlers.forEach((h) => h(state));
  }

  onStateChange(handler: StateHandler) {
    this.stateHandlers.add(handler);
    return () => {
      this.stateHandlers.delete(handler);
    };
  }

  onData(handler: DataHandler) {
    this.dataHandlers.add(handler);
    return () => {
      this.dataHandlers.delete(handler);
    };
  }

  async connect(roomCode: string): Promise<void> {
    this.setState("connecting");

    await this.signaling.connect(roomCode);

    this.signaling.onMessage((msg) => this.handleSignalingMessage(msg));
  }

  private async handleSignalingMessage(msg: SignalingMessage) {
    switch (msg.type) {
      case "welcome":
        this.peerId = msg.peerId;
        if (msg.peerId === "host") {
          // Host waits for guest
        }
        break;

      case "peer-joined":
        // Host creates offer
        await this.createOffer();
        break;

      case "offer":
        await this.handleOffer(msg.sdp);
        break;

      case "answer":
        await this.handleAnswer(msg.sdp);
        break;

      case "ice-candidate":
        await this.pc?.addIceCandidate(new RTCIceCandidate(msg.candidate));
        break;

      case "peer-left":
        this.setState("disconnected");
        break;
    }
  }

  private createPeerConnection() {
    this.pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.signaling.send({
          type: "ice-candidate",
          candidate: event.candidate.toJSON(),
        });
      }
    };

    this.pc.onconnectionstatechange = () => {
      if (this.pc?.connectionState === "connected") {
        this.setState("connected");
      } else if (
        this.pc?.connectionState === "disconnected" ||
        this.pc?.connectionState === "failed"
      ) {
        this.setState("disconnected");
      }
    };

    this.pc.ondatachannel = (event) => {
      this.dc = event.channel;
      this.setupDataChannel();
    };
  }

  private setupDataChannel() {
    if (!this.dc) return;

    this.dc.binaryType = "arraybuffer";

    this.dc.onmessage = (event) => {
      if (typeof event.data === "string") {
        const msg = JSON.parse(event.data);
        if (msg.type === "file-meta") {
          this.receiveMetadata = {
            name: msg.name,
            size: msg.size,
            id: msg.id,
          };
          this.receiveBuffer = [];
        } else if (msg.type === "file-end") {
          if (this.receiveMetadata) {
            const blob = new Blob(this.receiveBuffer);
            const reader = new FileReader();
            reader.onload = () => {
              this.dataHandlers.forEach((h) =>
                h({
                  id: this.receiveMetadata!.id,
                  type: "file",
                  name: this.receiveMetadata!.name,
                  size: this.receiveMetadata!.size,
                  data: reader.result as ArrayBuffer,
                  direction: "receive",
                })
              );
              this.receiveMetadata = null;
              this.receiveBuffer = [];
            };
            reader.readAsArrayBuffer(blob);
          }
        } else if (msg.type === "text") {
          this.dataHandlers.forEach((h) =>
            h({
              id: crypto.randomUUID(),
              type: "text",
              text: msg.text,
              direction: "receive",
            })
          );
        } else if (msg.type === "clipboard") {
          this.dataHandlers.forEach((h) =>
            h({
              id: crypto.randomUUID(),
              type: "text",
              text: msg.text,
              direction: "receive",
              name: "__clipboard__",
            })
          );
        }
      } else {
        // Binary data - file chunk
        this.receiveBuffer.push(event.data);
      }
    };
  }

  private async createOffer() {
    this.createPeerConnection();

    this.dc = this.pc!.createDataChannel("transfer");
    this.setupDataChannel();

    const offer = await this.pc!.createOffer();
    await this.pc!.setLocalDescription(offer);

    this.signaling.send({
      type: "offer",
      sdp: this.pc!.localDescription!,
    });
  }

  private async handleOffer(sdp: RTCSessionDescriptionInit) {
    this.createPeerConnection();

    await this.pc!.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await this.pc!.createAnswer();
    await this.pc!.setLocalDescription(answer);

    this.signaling.send({
      type: "answer",
      sdp: this.pc!.localDescription!,
    });
  }

  private async handleAnswer(sdp: RTCSessionDescriptionInit) {
    await this.pc!.setRemoteDescription(new RTCSessionDescription(sdp));
  }

  async sendFile(file: File) {
    if (!this.dc || this.dc.readyState !== "open") return;

    const id = crypto.randomUUID();

    // Send metadata
    this.dc.send(
      JSON.stringify({
        type: "file-meta",
        name: file.name,
        size: file.size,
        id,
      })
    );

    // Send chunks
    const buffer = await file.arrayBuffer();
    let offset = 0;

    while (offset < buffer.byteLength) {
      const chunk = buffer.slice(offset, offset + CHUNK_SIZE);

      // Wait for buffer to drain if needed
      while (
        this.dc.bufferedAmount > CHUNK_SIZE * 8 &&
        this.dc.readyState === "open"
      ) {
        await new Promise((r) => setTimeout(r, 10));
      }

      this.dc.send(chunk);
      offset += CHUNK_SIZE;
    }

    // Send end marker
    this.dc.send(JSON.stringify({ type: "file-end", id }));
  }

  sendText(text: string) {
    if (!this.dc || this.dc.readyState !== "open") return;
    this.dc.send(JSON.stringify({ type: "text", text }));
  }

  sendClipboard(text: string) {
    if (!this.dc || this.dc.readyState !== "open") return;
    this.dc.send(JSON.stringify({ type: "clipboard", text }));
  }

  disconnect() {
    this.dc?.close();
    this.pc?.close();
    this.signaling.disconnect();
    this.dc = null;
    this.pc = null;
    this.setState("idle");
    this.stateHandlers.clear();
    this.dataHandlers.clear();
  }
}

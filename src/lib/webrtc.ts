import Peer, { type DataConnection } from "peerjs";

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
const PEER_PREFIX = "openclaw-";

export class WebRTCManager {
  private peer: Peer | null = null;
  private conn: DataConnection | null = null;
  private stateHandlers: Set<StateHandler> = new Set();
  private dataHandlers: Set<DataHandler> = new Set();
  private receiveBuffer: ArrayBuffer[] = [];
  private receiveMetadata: { name: string; size: number; id: string } | null =
    null;
  private _state: ConnectionState = "idle";
  peerId: string = "";

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

  /** Create a room (host mode) - returns the room code */
  createRoom(): Promise<string> {
    return new Promise((resolve, reject) => {
      const code = String(Math.floor(1000 + Math.random() * 9000));
      const peerId = PEER_PREFIX + code;

      this.peer = new Peer(peerId);
      this.setState("connecting");

      this.peer.on("open", () => {
        this.peerId = "host";
        this.setState("idle"); // waiting for guest
        resolve(code);
      });

      this.peer.on("connection", (conn) => {
        this.conn = conn;
        this.setupConnection(conn);
      });

      this.peer.on("error", (err) => {
        if (err.type === "unavailable-id") {
          // Room code collision, try again
          this.peer?.destroy();
          this.createRoom().then(resolve, reject);
        } else {
          reject(new Error(err.message || "Failed to create room"));
        }
      });
    });
  }

  /** Join a room (guest mode) */
  joinRoom(code: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const hostPeerId = PEER_PREFIX + code;

      this.peer = new Peer();
      this.setState("connecting");

      this.peer.on("open", () => {
        this.peerId = "guest";
        const conn = this.peer!.connect(hostPeerId, { reliable: true });
        this.conn = conn;
        this.setupConnection(conn);
        resolve();
      });

      this.peer.on("error", (err) => {
        reject(new Error(err.message || "Failed to join room"));
      });
    });
  }

  private setupConnection(conn: DataConnection) {
    conn.on("open", () => {
      this.setState("connected");
    });

    conn.on("data", (raw) => {
      if (raw instanceof ArrayBuffer) {
        this.receiveBuffer.push(raw);
        return;
      }

      const msg = raw as Record<string, unknown>;

      if (msg.type === "file-meta") {
        this.receiveMetadata = {
          name: msg.name as string,
          size: msg.size as number,
          id: msg.id as string,
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
            text: msg.text as string,
            direction: "receive",
          })
        );
      } else if (msg.type === "clipboard") {
        this.dataHandlers.forEach((h) =>
          h({
            id: crypto.randomUUID(),
            type: "text",
            text: msg.text as string,
            direction: "receive",
            name: "__clipboard__",
          })
        );
      }
    });

    conn.on("close", () => {
      this.setState("disconnected");
    });

    conn.on("error", () => {
      this.setState("disconnected");
    });
  }

  async sendFile(file: File) {
    if (!this.conn?.open) return;

    const id = crypto.randomUUID();

    // Send metadata
    this.conn.send({
      type: "file-meta",
      name: file.name,
      size: file.size,
      id,
    });

    // Send chunks
    const buffer = await file.arrayBuffer();
    let offset = 0;

    while (offset < buffer.byteLength) {
      const chunk = buffer.slice(offset, offset + CHUNK_SIZE);
      this.conn.send(chunk);
      offset += CHUNK_SIZE;

      // Yield to avoid blocking
      if (offset % (CHUNK_SIZE * 16) === 0) {
        await new Promise((r) => setTimeout(r, 0));
      }
    }

    // Send end marker
    this.conn.send({ type: "file-end", id });
  }

  sendText(text: string) {
    if (!this.conn?.open) return;
    this.conn.send({ type: "text", text });
  }

  sendClipboard(text: string) {
    if (!this.conn?.open) return;
    this.conn.send({ type: "clipboard", text });
  }

  disconnect() {
    this.conn?.close();
    this.peer?.destroy();
    this.conn = null;
    this.peer = null;
    this.setState("idle");
    this.stateHandlers.clear();
    this.dataHandlers.clear();
  }
}

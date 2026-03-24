import Peer, { type DataConnection } from "peerjs";

export type ConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected";

export type TransferStatus = "pending" | "transferring" | "done" | "error";

export interface TransferItem {
  id: string;
  type: "file" | "text";
  name?: string;
  size?: number;
  data?: ArrayBuffer;
  text?: string;
  progress?: number; // 0-1
  status?: TransferStatus;
  direction: "send" | "receive";
}

type StateHandler = (state: ConnectionState) => void;
type DataHandler = (data: TransferItem) => void;
type ProgressHandler = (id: string, progress: number, status: TransferStatus) => void;

const CHUNK_SIZE = 16384; // 16KB chunks
const HIGH_WATER_MARK = CHUNK_SIZE * 8; // 128KB buffer threshold
const PEER_PREFIX = "openclaw-";
const CONNECT_TIMEOUT = 15000; // 15s connection timeout

// ICE servers for better NAT traversal
const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun.cloudflare.com:3478" },
  {
    urls: "turn:openrelay.metered.ca:80",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
  {
    urls: "turn:openrelay.metered.ca:443",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
  {
    urls: "turn:openrelay.metered.ca:443?transport=tcp",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
];

const PEER_CONFIG = {
  config: { iceServers: ICE_SERVERS },
};

export class WebRTCManager {
  private peer: Peer | null = null;
  private conn: DataConnection | null = null;
  private stateHandlers: Set<StateHandler> = new Set();
  private dataHandlers: Set<DataHandler> = new Set();
  private progressHandlers: Set<ProgressHandler> = new Set();
  private receiveBuffer: ArrayBuffer[] = [];
  private receivedBytes: number = 0;
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

  private emitProgress(id: string, progress: number, status: TransferStatus) {
    this.progressHandlers.forEach((h) => h(id, progress, status));
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

  onProgress(handler: ProgressHandler) {
    this.progressHandlers.add(handler);
    return () => {
      this.progressHandlers.delete(handler);
    };
  }

  /** Create a room (host mode) - returns the room code */
  createRoom(): Promise<string> {
    return new Promise((resolve, reject) => {
      const code = String(Math.floor(1000 + Math.random() * 9000));
      const peerId = PEER_PREFIX + code;

      this.peer = new Peer(peerId, PEER_CONFIG);
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
      let settled = false;

      const timeout = setTimeout(() => {
        if (!settled) {
          settled = true;
          this.peer?.destroy();
          reject(new Error("连接超时，请确认房间号正确且对方在线"));
        }
      }, CONNECT_TIMEOUT);

      this.peer = new Peer(PEER_CONFIG);
      this.setState("connecting");

      this.peer.on("open", () => {
        this.peerId = "guest";
        const conn = this.peer!.connect(hostPeerId, { reliable: true });
        this.conn = conn;
        this.setupConnection(conn);

        conn.on("open", () => {
          if (!settled) {
            settled = true;
            clearTimeout(timeout);
          }
        });

        // Resolve immediately so UI navigates to room page
        // Connection status is tracked via onStateChange
        resolve();
      });

      this.peer.on("error", (err) => {
        if (!settled) {
          settled = true;
          clearTimeout(timeout);
          reject(new Error(err.message || "连接失败"));
        }
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
        this.receivedBytes += raw.byteLength;

        // Emit receive progress
        if (this.receiveMetadata) {
          const progress = Math.min(
            this.receivedBytes / this.receiveMetadata.size,
            0.99
          );
          this.emitProgress(
            this.receiveMetadata.id,
            progress,
            "transferring"
          );
        }
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
        this.receivedBytes = 0;

        // Notify a new file is incoming
        this.dataHandlers.forEach((h) =>
          h({
            id: msg.id as string,
            type: "file",
            name: msg.name as string,
            size: msg.size as number,
            progress: 0,
            status: "transferring",
            direction: "receive",
          })
        );
      } else if (msg.type === "file-end") {
        if (this.receiveMetadata) {
          const meta = this.receiveMetadata;
          const totalBytes = msg.totalBytes as number | undefined;

          // Integrity check: verify received bytes match expected total
          if (totalBytes != null && this.receivedBytes !== totalBytes) {
            this.emitProgress(meta.id, 0, "error");
            this.dataHandlers.forEach((h) =>
              h({
                id: meta.id,
                type: "file",
                name: meta.name,
                size: meta.size,
                progress: 0,
                status: "error",
                direction: "receive",
              })
            );
            this.receiveMetadata = null;
            this.receiveBuffer = [];
            this.receivedBytes = 0;
            return;
          }

          const blob = new Blob(this.receiveBuffer);
          const reader = new FileReader();
          reader.onload = () => {
            this.emitProgress(meta.id, 1, "done");
            this.dataHandlers.forEach((h) =>
              h({
                id: meta.id,
                type: "file",
                name: meta.name,
                size: meta.size,
                data: reader.result as ArrayBuffer,
                progress: 1,
                status: "done",
                direction: "receive",
              })
            );
          };
          reader.readAsArrayBuffer(blob);
          this.receiveMetadata = null;
          this.receiveBuffer = [];
          this.receivedBytes = 0;
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

  private waitForDrain(): Promise<void> {
    return new Promise((resolve) => {
      const dc = (this.conn as unknown as { dataChannel: RTCDataChannel })
        ?.dataChannel;
      if (!dc || dc.bufferedAmount <= HIGH_WATER_MARK) {
        resolve();
        return;
      }
      const check = () => {
        if (!dc || dc.bufferedAmount <= HIGH_WATER_MARK) {
          resolve();
        } else {
          setTimeout(check, 10);
        }
      };
      setTimeout(check, 10);
    });
  }

  async sendFile(file: File, id?: string): Promise<string> {
    if (!this.conn?.open) throw new Error("Not connected");

    if (!id) id = crypto.randomUUID();

    // Send metadata
    this.conn.send({
      type: "file-meta",
      name: file.name,
      size: file.size,
      id,
    });

    this.emitProgress(id, 0, "transferring");

    // Stream file in chunks using Blob.slice to avoid loading entire file
    let offset = 0;

    while (offset < file.size) {
      if (!this.conn?.open) {
        this.emitProgress(id, offset / file.size, "error");
        throw new Error("Connection lost during transfer");
      }

      const end = Math.min(offset + CHUNK_SIZE, file.size);
      const slice = file.slice(offset, end);
      const chunk = await slice.arrayBuffer();
      this.conn.send(chunk);
      offset = end;

      // Emit send progress
      const progress = offset / file.size;
      this.emitProgress(id, progress, "transferring");

      // Backpressure: wait for buffer to drain
      await this.waitForDrain();
    }

    // Wait for last chunks to drain before sending end marker
    await this.waitForDrain();

    // Send end marker with totalBytes for integrity check
    this.conn.send({ type: "file-end", id, totalBytes: file.size });
    this.emitProgress(id, 1, "done");

    return id;
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
    this.progressHandlers.clear();
  }
}

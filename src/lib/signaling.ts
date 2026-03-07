export type SignalingMessage =
  | { type: "welcome"; peerId: string }
  | { type: "peer-joined" }
  | { type: "peer-left" }
  | { type: "offer"; sdp: RTCSessionDescriptionInit }
  | { type: "answer"; sdp: RTCSessionDescriptionInit }
  | { type: "ice-candidate"; candidate: RTCIceCandidateInit };

type MessageHandler = (msg: SignalingMessage) => void;

export class SignalingClient {
  private ws: WebSocket | null = null;
  private handlers: Set<MessageHandler> = new Set();

  async connect(roomCode: string): Promise<void> {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const url = `${protocol}//${window.location.host}/api/room?room=${roomCode}`;

    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => resolve();
      this.ws.onerror = () => reject(new Error("WebSocket connection failed"));

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as SignalingMessage;
          this.handlers.forEach((handler) => handler(msg));
        } catch {
          // ignore invalid messages
        }
      };

      this.ws.onclose = () => {
        this.handlers.forEach((handler) =>
          handler({ type: "peer-left" } as SignalingMessage)
        );
      };
    });
  }

  send(msg: SignalingMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  onMessage(handler: MessageHandler) {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
    this.handlers.clear();
  }
}

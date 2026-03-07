// Durable Object class for WebRTC signaling
// This runs on the Cloudflare Worker runtime

export class SignalingRoom {
  private state: DurableObjectState;
  private connections: Map<string, WebSocket> = new Map();
  private createdAt: number = 0;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/ws") {
      return this.handleWebSocket(request);
    }

    if (url.pathname === "/info") {
      return Response.json({
        peers: this.connections.size,
        createdAt: this.createdAt,
      });
    }

    return new Response("Not found", { status: 404 });
  }

  private handleWebSocket(request: Request): Response {
    if (this.connections.size >= 2) {
      return Response.json({ error: "Room is full" }, { status: 409 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    const peerId = this.connections.size === 0 ? "host" : "guest";

    this.state.acceptWebSocket(server, [peerId]);

    this.connections.set(peerId, server);

    if (!this.createdAt) {
      this.createdAt = Date.now();
      // Set 5-minute alarm for cleanup
      this.state.storage.setAlarm(Date.now() + 5 * 60 * 1000);
    }

    // Notify host that guest has joined
    if (peerId === "guest") {
      const host = this.connections.get("host");
      if (host) {
        try {
          host.send(JSON.stringify({ type: "peer-joined" }));
        } catch {
          // host disconnected
        }
      }
      // Cancel alarm since room is now active
      this.state.storage.deleteAlarm();
    }

    server.send(JSON.stringify({ type: "welcome", peerId }));

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    if (typeof message !== "string") return;

    // Relay message to the other peer
    for (const [, conn] of this.connections) {
      if (conn !== ws) {
        try {
          conn.send(message);
        } catch {
          // peer disconnected
        }
      }
    }
  }

  async webSocketClose(ws: WebSocket) {
    this.removeConnection(ws);

    // Notify remaining peer
    for (const [, conn] of this.connections) {
      try {
        conn.send(JSON.stringify({ type: "peer-left" }));
      } catch {
        // ignore
      }
    }

    if (this.connections.size === 0) {
      // Clean up after last peer leaves
      this.state.storage.deleteAlarm();
    }
  }

  async webSocketError(ws: WebSocket) {
    this.removeConnection(ws);
  }

  async alarm() {
    // Room expired - close all connections
    for (const [, conn] of this.connections) {
      try {
        conn.close(1000, "Room expired");
      } catch {
        // ignore
      }
    }
    this.connections.clear();
  }

  private removeConnection(ws: WebSocket) {
    for (const [id, conn] of this.connections) {
      if (conn === ws) {
        this.connections.delete(id);
        break;
      }
    }
  }
}

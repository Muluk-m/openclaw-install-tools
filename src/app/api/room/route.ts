import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

function generateRoomCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  const { env } = await getCloudflareContext({ async: true });
  const signalingNs = (env as Record<string, unknown>).SIGNALING as DurableObjectNamespace;

  if (!signalingNs) {
    return NextResponse.json(
      { error: "Signaling service not configured" },
      { status: 503 }
    );
  }

  if (action === "create") {
    const roomCode = generateRoomCode();
    // Create the DO instance keyed by room code
    const id = signalingNs.idFromName(roomCode);
    const stub = signalingNs.get(id);

    // Check if room is available
    const info = await stub.fetch(new Request("https://do/info"));
    const data = (await info.json()) as { peers: number };

    if (data.peers > 0) {
      // Unlikely collision, try again
      const newCode = generateRoomCode();
      return NextResponse.json({ roomCode: newCode });
    }

    return NextResponse.json({ roomCode });
  }

  if (action === "check") {
    const roomCode = searchParams.get("room");
    if (!roomCode || roomCode.length !== 4) {
      return NextResponse.json({ error: "Invalid room code" }, { status: 400 });
    }

    const id = signalingNs.idFromName(roomCode);
    const stub = signalingNs.get(id);

    const info = await stub.fetch(new Request("https://do/info"));
    const data = (await info.json()) as { peers: number };

    return NextResponse.json({ exists: data.peers > 0, peers: data.peers });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

// WebSocket upgrade endpoint
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const roomCode = searchParams.get("room");

  if (!roomCode || roomCode.length !== 4) {
    return NextResponse.json({ error: "Invalid room code" }, { status: 400 });
  }

  const upgradeHeader = request.headers.get("Upgrade");
  if (upgradeHeader !== "websocket") {
    return NextResponse.json(
      { error: "Expected WebSocket upgrade" },
      { status: 426 }
    );
  }

  const { env } = await getCloudflareContext({ async: true });
  const signalingNs = (env as Record<string, unknown>).SIGNALING as DurableObjectNamespace;

  if (!signalingNs) {
    return NextResponse.json(
      { error: "Signaling service not configured" },
      { status: 503 }
    );
  }

  const id = signalingNs.idFromName(roomCode);
  const stub = signalingNs.get(id);

  // Forward the WebSocket upgrade to the Durable Object
  return stub.fetch(new Request("https://do/ws", { headers: request.headers }));
}

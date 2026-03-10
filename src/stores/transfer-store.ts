import { create } from "zustand";
import {
  WebRTCManager,
  type ConnectionState,
  type TransferItem,
} from "@/lib/webrtc";

interface TransferState {
  roomCode: string;
  connectionState: ConnectionState;
  peerId: string;
  items: TransferItem[];
  clipboardSyncEnabled: boolean;
  manager: WebRTCManager | null;
  createRoom: () => Promise<string>;
  joinRoom: (code: string) => Promise<void>;
  sendFile: (file: File) => Promise<void>;
  sendText: (text: string) => void;
  toggleClipboardSync: () => void;
  disconnect: () => void;
}

function setupManager(
  manager: WebRTCManager,
  set: (fn: (s: TransferState) => Partial<TransferState>) => void,
  get: () => TransferState
) {
  manager.onStateChange((state) => {
    set(() => ({ connectionState: state, peerId: manager.peerId }));
  });

  manager.onData((item) => {
    if (item.name === "__clipboard__") {
      if (get().clipboardSyncEnabled && item.text) {
        navigator.clipboard.writeText(item.text).catch(() => {});
      }
      return;
    }

    set((s) => {
      // If this is a file-end (has data), update existing item instead of adding duplicate
      if (item.type === "file" && item.data) {
        const existing = s.items.find(
          (i) => i.id === item.id && i.direction === "receive"
        );
        if (existing) {
          return {
            items: s.items.map((i) =>
              i.id === item.id && i.direction === "receive"
                ? { ...i, data: item.data, progress: 1, status: "done" as const }
                : i
            ),
          };
        }
      }

      // If this is a new receiving file (no data yet), add it
      const alreadyExists = s.items.some(
        (i) => i.id === item.id && i.direction === item.direction
      );
      if (alreadyExists) return {};

      return { items: [...s.items, item] };
    });
  });

  manager.onProgress((id, progress, status) => {
    set((s) => ({
      items: s.items.map((i) =>
        i.id === id ? { ...i, progress, status } : i
      ),
    }));
  });
}

export const useTransferStore = create<TransferState>((set, get) => ({
  roomCode: "",
  connectionState: "idle",
  peerId: "",
  items: [],
  clipboardSyncEnabled: false,
  manager: null,

  createRoom: async () => {
    const manager = new WebRTCManager();
    setupManager(manager, set, get);

    const roomCode = await manager.createRoom();
    set(() => ({ roomCode, manager }));
    return roomCode;
  },

  joinRoom: async (code: string) => {
    const manager = new WebRTCManager();
    setupManager(manager, set, get);

    await manager.joinRoom(code);
    set(() => ({ roomCode: code, manager }));
  },

  sendFile: async (file: File) => {
    const { manager } = get();
    if (!manager) return;

    const id = crypto.randomUUID();
    const item: TransferItem = {
      id,
      type: "file",
      name: file.name,
      size: file.size,
      progress: 0,
      status: "pending",
      direction: "send",
    };
    set((s) => ({ items: [...s.items, item] }));

    try {
      await manager.sendFile(file, id);
    } catch {
      set((s) => ({
        items: s.items.map((i) =>
          i.id === id && i.direction === "send"
            ? { ...i, status: "error" as const }
            : i
        ),
      }));
    }
  },

  sendText: (text: string) => {
    const { manager } = get();
    if (!manager) return;

    manager.sendText(text);

    const item: TransferItem = {
      id: crypto.randomUUID(),
      type: "text",
      text,
      direction: "send",
    };
    set((s) => ({ items: [...s.items, item] }));
  },

  toggleClipboardSync: () => {
    set((s) => ({ clipboardSyncEnabled: !s.clipboardSyncEnabled }));
  },

  disconnect: () => {
    const { manager } = get();
    manager?.disconnect();
    set(() => ({
      roomCode: "",
      connectionState: "idle",
      peerId: "",
      items: [],
      clipboardSyncEnabled: false,
      manager: null,
    }));
  },
}));

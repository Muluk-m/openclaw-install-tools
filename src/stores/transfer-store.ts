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

export const useTransferStore = create<TransferState>((set, get) => ({
  roomCode: "",
  connectionState: "idle",
  peerId: "",
  items: [],
  clipboardSyncEnabled: false,
  manager: null,

  createRoom: async () => {
    const res = await fetch("/api/room?action=create", { method: "POST" });
    const data = (await res.json()) as { roomCode: string };
    const manager = new WebRTCManager();

    manager.onStateChange((state) => {
      set({ connectionState: state, peerId: manager.peerId });
    });

    manager.onData((item) => {
      if (item.name === "__clipboard__") {
        // Clipboard sync - write to clipboard
        if (get().clipboardSyncEnabled && item.text) {
          navigator.clipboard.writeText(item.text).catch(() => {});
        }
        return;
      }
      set((s) => ({ items: [...s.items, item] }));
    });

    await manager.connect(data.roomCode);
    set({ roomCode: data.roomCode, manager });
    return data.roomCode;
  },

  joinRoom: async (code: string) => {
    const manager = new WebRTCManager();

    manager.onStateChange((state) => {
      set({ connectionState: state, peerId: manager.peerId });
    });

    manager.onData((item) => {
      if (item.name === "__clipboard__") {
        if (get().clipboardSyncEnabled && item.text) {
          navigator.clipboard.writeText(item.text).catch(() => {});
        }
        return;
      }
      set((s) => ({ items: [...s.items, item] }));
    });

    await manager.connect(code);
    set({ roomCode: code, manager });
  },

  sendFile: async (file: File) => {
    const { manager } = get();
    if (!manager) return;

    const item: TransferItem = {
      id: crypto.randomUUID(),
      type: "file",
      name: file.name,
      size: file.size,
      direction: "send",
    };
    set((s) => ({ items: [...s.items, item] }));

    await manager.sendFile(file);
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
    set({
      roomCode: "",
      connectionState: "idle",
      peerId: "",
      items: [],
      clipboardSyncEnabled: false,
      manager: null,
    });
  },
}));

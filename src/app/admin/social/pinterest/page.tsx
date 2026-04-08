"use client";

import { useCallback, useEffect, useState } from "react";
import { ACTIVE_SERVICES } from "@/content/services";
import { AREA_LIST } from "@/content/areas";

type Board = {
  id: string;
  boardId: string;
  name: string;
  description: string | null;
  url: string | null;
  pinCount: number;
  serviceType: string | null;
  area: string | null;
  isDefault: boolean;
};

const SERVICE_OPTIONS = ACTIVE_SERVICES.map((s) => ({ value: s.slug, label: s.shortTitle }));
const AREA_OPTIONS = AREA_LIST.map((a) => ({ value: a.slug, label: a.name }));

const SUGGESTED_BOARDS = [
  { name: "Floating Shelves Las Vegas", serviceType: "floating-shelves" },
  { name: "Custom Cabinets Las Vegas", serviceType: "custom-cabinetry" },
  { name: "Media Walls Las Vegas", serviceType: null },
  { name: "Barn Doors Las Vegas", serviceType: null },
  { name: "Faux Beams Las Vegas", serviceType: null },
  { name: "Mantels Las Vegas", serviceType: "mantels" },
  { name: "Closet Systems Las Vegas", serviceType: "closet-systems" },
  { name: "LED Lighting Ideas", serviceType: null },
  { name: "Las Vegas Custom Woodwork", serviceType: null },
  { name: "Henderson Custom Carpentry", serviceType: null },
  { name: "Summerlin Home Upgrades", serviceType: null },
  { name: "Lake Las Vegas Interiors", serviceType: null },
  { name: "Custom Woodwork Ideas", serviceType: null },
  { name: "White Oak Wood Projects", serviceType: null },
  { name: "Modern Living Room Ideas", serviceType: null },
  { name: "Kitchen Organization Ideas", serviceType: "pantry-pullouts" },
  { name: "Home Office Built-Ins", serviceType: "built-ins" },
];

export default function PinterestBoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    const res = await fetch("/api/admin/social/pinterest/boards");
    setIsLoading(false);
    if (!res.ok) return;
    const data = (await res.json()) as { boards: Board[] };
    setBoards(data.boards ?? []);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function sync() {
    setIsSyncing(true);
    setError(null);
    const res = await fetch("/api/admin/social/pinterest/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "sync" }),
    });
    setIsSyncing(false);
    const data = (await res.json()) as { ok: boolean; synced?: number; error?: string };
    if (!data.ok) { setError(data.error ?? "Sync failed."); return; }
    setSuccessMsg(`Synced ${data.synced ?? 0} boards from Pinterest.`);
    await load();
  }

  async function createBoard() {
    if (!newName.trim()) return;
    setIsCreating(true);
    setError(null);
    const res = await fetch("/api/admin/social/pinterest/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() }),
    });
    setIsCreating(false);
    const data = (await res.json()) as { ok: boolean; error?: string };
    if (!data.ok) { setError(data.error ?? "Failed to create board."); return; }
    setNewName(""); setNewDesc(""); setShowCreate(false);
    setSuccessMsg("Board created.");
    await load();
  }

  async function updateBoard(boardId: string, patch: Partial<Board>) {
    await fetch(`/api/admin/social/pinterest/boards/${boardId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    await load();
  }

  async function deleteBoard(boardId: string) {
    if (!confirm("Remove this board from the system? This does not delete it on Pinterest.")) return;
    await fetch(`/api/admin/social/pinterest/boards/${boardId}`, { method: "DELETE" });
    await load();
  }

  // Group boards
  const serviceBoards = boards.filter((b) => b.serviceType);
  const areaBoards = boards.filter((b) => !b.serviceType && b.area);
  const otherBoards = boards.filter((b) => !b.serviceType && !b.area);

  function BoardRow({ board }: { board: Board }) {
    const [editing, setEditing] = useState(false);
    const [svc, setSvc] = useState(board.serviceType ?? "");
    const [area, setArea] = useState(board.area ?? "");
    const [isDefault, setIsDefault] = useState(board.isDefault);

    async function save() {
      await updateBoard(board.boardId, {
        serviceType: svc || null,
        area: area || null,
        isDefault,
      });
      setEditing(false);
    }

    return (
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-warm bg-white px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-ui text-sm font-medium text-charcoal">{board.name}</span>
            {board.isDefault && (
              <span className="rounded-full bg-green-50 border border-green-200 px-2 py-0.5 font-ui text-[10px] uppercase tracking-[0.14em] text-green-700">Default</span>
            )}
          </div>
          <p className="font-ui text-xs text-gray-mid">{board.pinCount} pins{board.url ? ` · ${board.url}` : ""}</p>
        </div>

        {editing ? (
          <div className="flex flex-wrap items-center gap-2">
            <select value={svc} onChange={(e) => setSvc(e.target.value)} className="rounded border border-gray-warm bg-white px-2 py-1 font-ui text-xs text-charcoal outline-none focus:border-navy">
              <option value="">No service</option>
              {SERVICE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={area} onChange={(e) => setArea(e.target.value)} className="rounded border border-gray-warm bg-white px-2 py-1 font-ui text-xs text-charcoal outline-none focus:border-navy">
              <option value="">No area</option>
              {AREA_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <label className="flex items-center gap-1 font-ui text-xs text-charcoal">
              <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="accent-navy" />
              Default
            </label>
            <button type="button" onClick={() => void save()} className="rounded-sm bg-navy px-3 py-1 font-ui text-xs text-white hover:bg-navy/90">Save</button>
            <button type="button" onClick={() => setEditing(false)} className="font-ui text-xs text-gray-mid hover:text-charcoal">Cancel</button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-right">
            {board.serviceType && (
              <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 font-ui text-[10px] text-gray-mid">{board.serviceType}</span>
            )}
            {board.area && (
              <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 font-ui text-[10px] text-gray-mid">{board.area}</span>
            )}
            <button type="button" onClick={() => setEditing(true)} className="font-ui text-xs text-navy hover:text-red">Edit</button>
            <button type="button" onClick={() => void deleteBoard(board.boardId)} className="font-ui text-xs text-gray-mid hover:text-red">Remove</button>
          </div>
        )}
      </div>
    );
  }

  function BoardGroup({ title, items }: { title: string; items: Board[] }) {
    if (items.length === 0) return null;
    return (
      <div>
        <p className="mb-2 font-ui text-xs font-semibold uppercase tracking-[0.16em] text-gray-mid">{title}</p>
        <div className="space-y-2">
          {items.map((b) => <BoardRow key={b.boardId} board={b} />)}
        </div>
      </div>
    );
  }

  return (
    <main className="bg-cream px-4 pb-16 pt-8 md:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mt-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl text-charcoal">Pinterest Boards</h1>
            <p className="mt-1 font-ui text-sm text-gray-mid">Manage boards and map them to services for auto-selection.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => void sync()} disabled={isSyncing} className="rounded-lg border border-gray-warm bg-white px-4 py-2 font-ui text-sm text-charcoal transition hover:border-navy disabled:opacity-50">
              {isSyncing ? "Syncing…" : "Sync from Pinterest"}
            </button>
            <button type="button" onClick={() => setShowCreate((v) => !v)} className="rounded-lg bg-navy px-4 py-2 font-ui text-sm text-white transition hover:bg-navy/90">
              + Create Board
            </button>
          </div>
        </div>

        {error ? <p className="mt-4 font-ui text-sm text-red">{error}</p> : null}
        {successMsg ? <p className="mt-4 font-ui text-sm text-green-700">{successMsg}</p> : null}

        {showCreate && (
          <div className="mt-4 rounded-xl border border-gray-warm bg-white p-4 space-y-3">
            <p className="font-ui text-xs font-semibold uppercase tracking-[0.16em] text-gray-mid">New Board</p>
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Board name" className="w-full rounded-lg border border-gray-warm px-3 py-2 font-ui text-sm text-charcoal outline-none focus:border-navy" />
            <input type="text" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Description (optional)" className="w-full rounded-lg border border-gray-warm px-3 py-2 font-ui text-sm text-charcoal outline-none focus:border-navy" />
            <div className="flex gap-2">
              <button type="button" onClick={() => void createBoard()} disabled={isCreating || !newName.trim()} className="rounded-lg bg-navy px-4 py-2 font-ui text-sm text-white disabled:opacity-50">
                {isCreating ? "Creating…" : "Create Board"}
              </button>
              <button type="button" onClick={() => setShowCreate(false)} className="font-ui text-sm text-gray-mid hover:text-charcoal">Cancel</button>
            </div>
          </div>
        )}

        {isLoading ? (
          <p className="mt-8 font-ui text-sm text-gray-mid">Loading…</p>
        ) : boards.length === 0 ? (
          <div className="mt-8 rounded-xl border border-gray-warm bg-white p-8 text-center">
            <p className="font-ui text-sm text-charcoal">No boards yet.</p>
            <p className="mt-1 font-ui text-xs text-gray-mid">Connect Pinterest in Settings, then click Sync to import your boards.</p>
            <div className="mt-6">
              <p className="font-ui text-xs font-semibold uppercase tracking-[0.16em] text-gray-mid">Suggested boards to create on Pinterest:</p>
              <div className="mt-3 flex flex-wrap gap-2 justify-center">
                {SUGGESTED_BOARDS.map((b) => (
                  <span key={b.name} className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 font-ui text-xs text-charcoal">{b.name}</span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <BoardGroup title="Service Boards" items={serviceBoards} />
            <BoardGroup title="Location Boards" items={areaBoards} />
            <BoardGroup title="Inspiration Boards" items={otherBoards} />
          </div>
        )}
      </div>
    </main>
  );
}

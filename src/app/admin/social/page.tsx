"use client";

import { useCallback, useEffect, useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

type Tab = "queue" | "composer" | "calendar" | "analytics" | "settings";

type ScheduledPost = {
  id: string;
  platform: string;
  caption: string;
  hashtags: string | null;
  status: string;
  scheduledFor: string | null;
  postedAt: string | null;
  errorMessage: string | null;
  createdAt: string;
  pinTitle: string | null;
  pinUrl: string | null;
  boardId: string | null;
  title: string | null;
  project: { id: string; title: string; slug: string } | null;
};

type SocialAccount = {
  id: string;
  platform: string;
  accountId: string | null;
  accountName: string | null;
  connected: boolean;
  connectedAt: string | null;
};

type PinterestBoard = { id: string; name: string };

// ── Constants ─────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string }[] = [
  { id: "queue", label: "Queue" },
  { id: "composer", label: "Composer" },
  { id: "calendar", label: "Calendar" },
  { id: "analytics", label: "Analytics" },
  { id: "settings", label: "Settings" },
];

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  pinterest: "Pinterest",
  youtube: "YouTube",
  both: "IG + FB",
};

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "bg-pink-50 border-pink-200 text-pink-700",
  facebook: "bg-blue-50 border-blue-200 text-blue-700",
  pinterest: "bg-red/5 border-red/20 text-red",
  youtube: "bg-red/5 border-red/20 text-red",
  both: "bg-purple-50 border-purple-200 text-purple-700",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "text-blue-700 bg-blue-50 border-blue-200",
  posted: "text-green-700 bg-green-50 border-green-200",
  failed: "text-red bg-red/5 border-red/20",
  cancelled: "text-gray-mid bg-gray-50 border-gray-200",
};

const STATUS_ICONS: Record<string, string> = {
  pending: "⏱",
  posted: "✓",
  failed: "✗",
  cancelled: "—",
};

// ── Sub-components ─────────────────────────────────────────────────────────

function TabBar({ active, onSelect }: { active: Tab; onSelect: (t: Tab) => void }) {
  return (
    <div className="flex gap-1 border-b border-gray-warm">
      {TABS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelect(id)}
          className={`px-4 py-2.5 font-ui text-sm transition-colors ${
            active === id
              ? "border-b-2 border-navy text-navy -mb-px"
              : "text-gray-mid hover:text-charcoal"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function PlatformPill({ platform }: { platform: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-ui text-[10px] uppercase tracking-[0.14em] ${PLATFORM_COLORS[platform] ?? "bg-gray-50 border-gray-200 text-gray-mid"}`}>
      {PLATFORM_LABELS[platform] ?? platform}
    </span>
  );
}

// ── Queue Tab ─────────────────────────────────────────────────────────────

function QueueTab({ accounts }: { accounts: SocialAccount[] }) {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const res = await fetch("/api/admin/social/schedule");
    setIsLoading(false);
    if (!res.ok) { setError("Failed to load posts."); return; }
    const data = (await res.json()) as { posts: ScheduledPost[] };
    setPosts(data.posts ?? []);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function cancel(id: string) {
    await fetch(`/api/admin/social/${id}/cancel`, { method: "PATCH" });
    await load();
  }

  async function retry(id: string) {
    await fetch("/api/admin/social/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: id }),
    });
    await load();
  }

  const filtered = posts
    .filter((p) => !filterStatus || p.status === filterStatus)
    .filter((p) => !filterPlatform || p.platform === filterPlatform || (filterPlatform === "both" && p.platform === "both"));

  const counts = {
    pending: posts.filter((p) => p.status === "pending").length,
    posted: posts.filter((p) => p.status === "posted").length,
    failed: posts.filter((p) => p.status === "failed").length,
    cancelled: posts.filter((p) => p.status === "cancelled").length,
  };

  const connectedCount = accounts.filter((a) => a.connected).length;

  return (
    <div className="mt-6">
      {/* Connection pills */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="font-ui text-xs text-gray-mid">Connected:</span>
        {accounts.map((a) => (
          <span
            key={a.platform}
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-ui text-[10px] uppercase tracking-[0.14em] ${
              a.connected
                ? PLATFORM_COLORS[a.platform] ?? "bg-gray-50 border-gray-200 text-gray-mid"
                : "bg-gray-50 border-gray-200 text-gray-400"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${a.connected ? "bg-green-500" : "bg-gray-300"}`} />
            {PLATFORM_LABELS[a.platform] ?? a.platform}
          </span>
        ))}
        {connectedCount === 0 && (
          <span className="font-ui text-xs text-gray-mid">None — go to Settings to connect accounts</span>
        )}
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-4">
        {(Object.entries(counts) as [string, number][]).map(([status, count]) => (
          <div key={status} className="flex items-baseline gap-1.5">
            <span className={`font-ui text-lg font-semibold ${status === "failed" ? "text-red" : status === "posted" ? "text-green-700" : status === "pending" ? "text-blue-700" : "text-gray-mid"}`}>{count}</span>
            <span className="font-ui text-xs uppercase tracking-[0.14em] text-gray-mid">{status}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap gap-2">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-sm border border-gray-warm bg-white px-3 py-1.5 font-ui text-xs text-charcoal outline-none focus:border-navy">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="posted">Posted</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)} className="rounded-sm border border-gray-warm bg-white px-3 py-1.5 font-ui text-xs text-charcoal outline-none focus:border-navy">
          <option value="">All Platforms</option>
          <option value="instagram">Instagram</option>
          <option value="facebook">Facebook</option>
          <option value="pinterest">Pinterest</option>
          <option value="youtube">YouTube</option>
          <option value="both">IG + FB</option>
        </select>
      </div>

      {error ? <p className="mt-4 font-ui text-sm text-red">{error}</p> : null}
      {isLoading ? <p className="mt-6 font-ui text-sm text-gray-mid">Loading...</p> : null}

      {!isLoading ? (
        <div className="mt-5 space-y-3">
          {filtered.map((post) => {
            const when = post.scheduledFor
              ? `Scheduled ${new Date(post.scheduledFor).toLocaleString()}`
              : post.postedAt
                ? `Posted ${new Date(post.postedAt).toLocaleString()}`
                : `Created ${new Date(post.createdAt).toLocaleString()}`;
            return (
              <article key={post.id} className="rounded-xl border border-gray-warm bg-white p-4">
                <div className="flex flex-wrap items-start gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-ui text-[10px] uppercase tracking-[0.14em] ${STATUS_COLORS[post.status] ?? ""}`}>
                    {STATUS_ICONS[post.status]} {post.status}
                  </span>
                  <PlatformPill platform={post.platform} />
                  <span className="font-ui text-xs text-gray-mid">{when}</span>
                  {post.project ? (
                    <a href="/admin/projects" className="font-ui text-xs text-navy hover:text-red">
                      {post.project.title}
                    </a>
                  ) : null}
                  <div className="ml-auto flex gap-2">
                    {post.status === "pending" ? (
                      <button type="button" onClick={() => void cancel(post.id)} className="font-ui text-xs text-gray-mid transition hover:text-red">Cancel</button>
                    ) : null}
                    {post.status === "failed" ? (
                      <button type="button" onClick={() => void retry(post.id)} className="font-ui text-xs text-navy transition hover:text-red">Retry</button>
                    ) : null}
                  </div>
                </div>
                {post.title ? <p className="mt-2 font-ui text-xs font-medium text-charcoal">{post.title}</p> : null}
                <p className="mt-2 line-clamp-3 text-sm text-charcoal">{post.caption}</p>
                {post.errorMessage ? (
                  <p className="mt-2 font-ui text-xs text-red">{post.errorMessage}</p>
                ) : null}
              </article>
            );
          })}
          {!filtered.length ? (
            <p className="font-ui text-sm text-gray-mid">
              {posts.length > 0 ? "No posts match the current filters." : "No social posts yet. Use Composer to get started."}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

// ── Composer Tab ──────────────────────────────────────────────────────────

function ComposerTab({ accounts }: { accounts: SocialAccount[] }) {
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [mediaInput, setMediaInput] = useState("");
  const [scheduleMode, setScheduleMode] = useState<"now" | "later">("now");
  const [scheduledFor, setScheduledFor] = useState("");
  const [pinTitle, setPinTitle] = useState("");
  const [pinUrl, setPinUrl] = useState("");
  const [boardId, setBoardId] = useState("");
  const [ytTitle, setYtTitle] = useState("");
  const [ytDescription, setYtDescription] = useState("");
  const [ytVisibility, setYtVisibility] = useState("public");
  const [boards, setBoards] = useState<PinterestBoard[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const availablePlatforms = accounts.filter((a) => a.connected).map((a) => a.platform);

  useEffect(() => {
    if (platforms.includes("pinterest")) {
      fetch("/api/admin/social/pinterest/boards")
        .then((r) => r.json())
        .then((d: { boards: PinterestBoard[] }) => setBoards(d.boards ?? []))
        .catch(() => null);
    }
  }, [platforms]);

  function togglePlatform(p: string) {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  function addMedia() {
    const url = mediaInput.trim();
    if (url && !mediaUrls.includes(url)) {
      setMediaUrls((prev) => [...prev, url]);
      setMediaInput("");
    }
  }

  async function submit() {
    if (!platforms.length || !caption.trim()) {
      setErrorMsg("Select at least one platform and enter a caption.");
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const body: Record<string, unknown> = {
      platforms,
      caption,
      hashtags: hashtags || undefined,
      mediaUrls: mediaUrls.length ? mediaUrls : undefined,
      scheduledFor: scheduleMode === "later" && scheduledFor ? scheduledFor : undefined,
    };

    if (platforms.includes("pinterest")) {
      body.pinTitle = pinTitle || undefined;
      body.pinUrl = pinUrl || undefined;
      body.boardId = boardId || undefined;
    }
    if (platforms.includes("youtube")) {
      body.title = ytTitle || undefined;
      body.description = ytDescription || undefined;
      body.visibility = ytVisibility;
    }

    const res = await fetch("/api/admin/social/compose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setIsSubmitting(false);

    if (!res.ok) {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setErrorMsg(d.error ?? "Failed to create post.");
      return;
    }

    setSuccessMsg(scheduleMode === "later" ? "Post scheduled successfully." : "Post added to queue.");
    setCaption("");
    setHashtags("");
    setMediaUrls([]);
    setMediaInput("");
    setPinTitle(""); setPinUrl(""); setBoardId("");
    setYtTitle(""); setYtDescription("");
  }

  return (
    <div className="mt-6 max-w-2xl space-y-5">
      {/* Platform selector */}
      <div>
        <p className="mb-2 font-ui text-xs uppercase tracking-[0.14em] text-gray-mid">Platforms</p>
        <div className="flex flex-wrap gap-2">
          {(["instagram", "facebook", "pinterest", "youtube"] as const).map((p) => {
            const isConnected = availablePlatforms.includes(p);
            const isSelected = platforms.includes(p);
            return (
              <button
                key={p}
                type="button"
                disabled={!isConnected}
                onClick={() => togglePlatform(p)}
                className={`rounded-full border px-3 py-1 font-ui text-xs transition ${
                  !isConnected
                    ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                    : isSelected
                      ? "border-navy bg-navy text-white"
                      : "border-gray-warm bg-white text-charcoal hover:border-navy"
                }`}
              >
                {PLATFORM_LABELS[p]}
                {!isConnected && <span className="ml-1 text-[10px]">(not connected)</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Caption */}
      <div>
        <label className="mb-1 block font-ui text-xs uppercase tracking-[0.14em] text-gray-mid">Caption</label>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={5}
          placeholder="Write your caption here..."
          className="w-full rounded-lg border border-gray-warm bg-white px-3 py-2 font-ui text-sm text-charcoal outline-none focus:border-navy resize-none"
        />
        <p className="mt-1 text-right font-ui text-xs text-gray-mid">{caption.length} chars</p>
      </div>

      {/* Hashtags */}
      <div>
        <label className="mb-1 block font-ui text-xs uppercase tracking-[0.14em] text-gray-mid">Hashtags</label>
        <textarea
          value={hashtags}
          onChange={(e) => setHashtags(e.target.value)}
          rows={2}
          placeholder="#customcabinetry #lasvegas ..."
          className="w-full rounded-lg border border-gray-warm bg-white px-3 py-2 font-ui text-sm text-charcoal outline-none focus:border-navy resize-none"
        />
      </div>

      {/* Media URLs */}
      <div>
        <label className="mb-1 block font-ui text-xs uppercase tracking-[0.14em] text-gray-mid">Media URLs</label>
        <div className="flex gap-2">
          <input
            type="url"
            value={mediaInput}
            onChange={(e) => setMediaInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addMedia(); } }}
            placeholder="https://res.cloudinary.com/..."
            className="flex-1 rounded-lg border border-gray-warm bg-white px-3 py-2 font-ui text-sm text-charcoal outline-none focus:border-navy"
          />
          <button type="button" onClick={addMedia} className="rounded-lg border border-gray-warm px-3 py-2 font-ui text-xs text-charcoal hover:border-navy">Add</button>
        </div>
        {mediaUrls.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {mediaUrls.map((url, i) => (
              <div key={url} className="flex items-center gap-1 rounded-lg border border-gray-warm bg-gray-50 px-2 py-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-8 w-8 rounded object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <span className="font-ui text-xs text-gray-mid">#{i + 1}</span>
                <button type="button" onClick={() => setMediaUrls((prev) => prev.filter((u) => u !== url))} className="ml-1 font-ui text-xs text-gray-mid hover:text-red">×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pinterest-specific */}
      {platforms.includes("pinterest") && (
        <div className="rounded-xl border border-gray-warm bg-gray-50 p-4 space-y-3">
          <p className="font-ui text-xs font-semibold uppercase tracking-[0.14em] text-gray-mid">Pinterest</p>
          <div>
            <label className="mb-1 block font-ui text-xs text-gray-mid">Pin Title</label>
            <input type="text" value={pinTitle} onChange={(e) => setPinTitle(e.target.value)} className="w-full rounded-lg border border-gray-warm bg-white px-3 py-2 font-ui text-sm text-charcoal outline-none focus:border-navy" />
          </div>
          <div>
            <label className="mb-1 block font-ui text-xs text-gray-mid">Destination URL</label>
            <input type="url" value={pinUrl} onChange={(e) => setPinUrl(e.target.value)} className="w-full rounded-lg border border-gray-warm bg-white px-3 py-2 font-ui text-sm text-charcoal outline-none focus:border-navy" />
          </div>
          {boards.length > 0 && (
            <div>
              <label className="mb-1 block font-ui text-xs text-gray-mid">Board</label>
              <select value={boardId} onChange={(e) => setBoardId(e.target.value)} className="w-full rounded-lg border border-gray-warm bg-white px-3 py-2 font-ui text-sm text-charcoal outline-none focus:border-navy">
                <option value="">Select a board...</option>
                {boards.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          )}
        </div>
      )}

      {/* YouTube-specific */}
      {platforms.includes("youtube") && (
        <div className="rounded-xl border border-gray-warm bg-gray-50 p-4 space-y-3">
          <p className="font-ui text-xs font-semibold uppercase tracking-[0.14em] text-gray-mid">YouTube</p>
          <div>
            <label className="mb-1 block font-ui text-xs text-gray-mid">Video Title</label>
            <input type="text" value={ytTitle} onChange={(e) => setYtTitle(e.target.value)} className="w-full rounded-lg border border-gray-warm bg-white px-3 py-2 font-ui text-sm text-charcoal outline-none focus:border-navy" />
          </div>
          <div>
            <label className="mb-1 block font-ui text-xs text-gray-mid">Description</label>
            <textarea value={ytDescription} onChange={(e) => setYtDescription(e.target.value)} rows={3} className="w-full rounded-lg border border-gray-warm bg-white px-3 py-2 font-ui text-sm text-charcoal outline-none focus:border-navy resize-none" />
          </div>
          <div>
            <label className="mb-1 block font-ui text-xs text-gray-mid">Visibility</label>
            <select value={ytVisibility} onChange={(e) => setYtVisibility(e.target.value)} className="w-full rounded-lg border border-gray-warm bg-white px-3 py-2 font-ui text-sm text-charcoal outline-none focus:border-navy">
              <option value="public">Public</option>
              <option value="unlisted">Unlisted</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>
      )}

      {/* Schedule toggle */}
      <div>
        <p className="mb-2 font-ui text-xs uppercase tracking-[0.14em] text-gray-mid">When to post</p>
        <div className="flex gap-2">
          <button type="button" onClick={() => setScheduleMode("now")} className={`rounded-lg border px-4 py-2 font-ui text-sm transition ${scheduleMode === "now" ? "border-navy bg-navy text-white" : "border-gray-warm bg-white text-charcoal hover:border-navy"}`}>
            Post now
          </button>
          <button type="button" onClick={() => setScheduleMode("later")} className={`rounded-lg border px-4 py-2 font-ui text-sm transition ${scheduleMode === "later" ? "border-navy bg-navy text-white" : "border-gray-warm bg-white text-charcoal hover:border-navy"}`}>
            Schedule for later
          </button>
        </div>
        {scheduleMode === "later" && (
          <input
            type="datetime-local"
            value={scheduledFor}
            onChange={(e) => setScheduledFor(e.target.value)}
            className="mt-2 rounded-lg border border-gray-warm bg-white px-3 py-2 font-ui text-sm text-charcoal outline-none focus:border-navy"
          />
        )}
      </div>

      {errorMsg ? <p className="font-ui text-sm text-red">{errorMsg}</p> : null}
      {successMsg ? <p className="font-ui text-sm text-green-700">{successMsg}</p> : null}

      <button
        type="button"
        onClick={() => void submit()}
        disabled={isSubmitting}
        className="rounded-lg bg-navy px-6 py-2.5 font-ui text-sm text-white transition hover:bg-navy/90 disabled:opacity-50"
      >
        {isSubmitting ? "Posting..." : scheduleMode === "later" ? "Schedule Post" : "Post Now"}
      </button>
    </div>
  );
}

// ── Calendar Tab ──────────────────────────────────────────────────────────

function CalendarTab() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-indexed
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/social/schedule")
      .then((r) => r.json())
      .then((d: { posts: ScheduledPost[] }) => setPosts(d.posts ?? []))
      .catch(() => null);
  }, []);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Map posts to day numbers for this month
  const postsByDay: Record<number, ScheduledPost[]> = {};
  for (const p of posts) {
    const d = p.scheduledFor ?? p.postedAt ?? p.createdAt;
    const date = new Date(d);
    if (date.getFullYear() === year && date.getMonth() === month) {
      const day = date.getDate();
      postsByDay[day] = [...(postsByDay[day] ?? []), p];
    }
  }

  const selectedPosts = selectedDay !== null ? (postsByDay[selectedDay] ?? []) : [];
  const monthName = new Date(year, month).toLocaleString("default", { month: "long" });

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null) as null[],
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="mt-6">
      {/* Month nav */}
      <div className="mb-4 flex items-center gap-3">
        <button type="button" onClick={prevMonth} className="rounded-lg border border-gray-warm px-3 py-1.5 font-ui text-sm text-charcoal hover:border-navy">←</button>
        <span className="font-ui text-base font-semibold text-charcoal">{monthName} {year}</span>
        <button type="button" onClick={nextMonth} className="rounded-lg border border-gray-warm px-3 py-1.5 font-ui text-sm text-charcoal hover:border-navy">→</button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-px">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="pb-1 text-center font-ui text-[10px] uppercase tracking-[0.14em] text-gray-mid">{d}</div>
        ))}
        {cells.map((day, i) => (
          <div
            key={i}
            onClick={() => { if (day) setSelectedDay(selectedDay === day ? null : day); }}
            className={`min-h-[64px] rounded-lg border p-1.5 cursor-pointer transition ${
              day === null
                ? "border-transparent cursor-default"
                : selectedDay === day
                  ? "border-navy bg-navy/5"
                  : "border-gray-warm bg-white hover:border-gray-400"
            }`}
          >
            {day !== null ? (
              <>
                <span className={`font-ui text-xs ${day === now.getDate() && month === now.getMonth() && year === now.getFullYear() ? "font-bold text-navy" : "text-charcoal"}`}>{day}</span>
                <div className="mt-1 flex flex-wrap gap-0.5">
                  {(postsByDay[day] ?? []).map((p) => (
                    <span
                      key={p.id}
                      title={`${PLATFORM_LABELS[p.platform]} — ${p.status}`}
                      className={`h-2 w-2 rounded-full ${
                        p.status === "posted" ? "bg-green-500"
                        : p.status === "failed" ? "bg-red"
                        : p.status === "cancelled" ? "bg-gray-300"
                        : "bg-blue-400"
                      }`}
                    />
                  ))}
                </div>
              </>
            ) : null}
          </div>
        ))}
      </div>

      {/* Selected day detail */}
      {selectedDay !== null && selectedPosts.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="font-ui text-xs font-semibold uppercase tracking-[0.14em] text-gray-mid">{monthName} {selectedDay}</p>
          {selectedPosts.map((p) => (
            <div key={p.id} className="flex items-start gap-3 rounded-lg border border-gray-warm bg-white p-3">
              <PlatformPill platform={p.platform} />
              <div className="flex-1 min-w-0">
                <p className="line-clamp-2 text-sm text-charcoal">{p.caption}</p>
              </div>
              <span className={`shrink-0 rounded-full border px-2 py-0.5 font-ui text-[10px] uppercase tracking-[0.14em] ${STATUS_COLORS[p.status] ?? ""}`}>{p.status}</span>
            </div>
          ))}
        </div>
      )}
      {selectedDay !== null && selectedPosts.length === 0 && (
        <p className="mt-4 font-ui text-sm text-gray-mid">No posts on {monthName} {selectedDay}.</p>
      )}
    </div>
  );
}

// ── Analytics Tab ─────────────────────────────────────────────────────────

type AnalyticsData = {
  summary: { totalPosts: number; postedCount: number; pendingCount: number; failedCount: number };
  platforms: Record<string, Record<string, number | null>>;
};

const PLATFORM_METRIC_LABELS: Record<string, string[]> = {
  instagram: ["Followers", "Reach", "Impressions"],
  facebook: ["Followers", "Reach", "Impressions"],
  pinterest: ["Followers", "Monthly Views"],
  youtube: ["Subscribers", "Views"],
};

function AnalyticsTab({ accounts }: { accounts: SocialAccount[] }) {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetch("/api/admin/social/analytics")
      .then((r) => r.json())
      .then((d: AnalyticsData) => setData(d))
      .catch(() => null);
  }, []);

  const accountMap = Object.fromEntries(accounts.map((a) => [a.platform, a]));

  return (
    <div className="mt-6 space-y-6">
      {/* Summary */}
      {data && (
        <div className="flex flex-wrap gap-6">
          {[
            { label: "Total Posts", value: data.summary.totalPosts },
            { label: "Posted", value: data.summary.postedCount, color: "text-green-700" },
            { label: "Pending", value: data.summary.pendingCount, color: "text-blue-700" },
            { label: "Failed", value: data.summary.failedCount, color: "text-red" },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <p className={`font-ui text-2xl font-semibold ${color ?? "text-charcoal"}`}>{value}</p>
              <p className="font-ui text-xs uppercase tracking-[0.14em] text-gray-mid">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Platform cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(["instagram", "facebook", "pinterest", "youtube"] as const).map((platform) => {
          const account = accountMap[platform];
          const isConnected = account?.connected;
          const metricLabels = PLATFORM_METRIC_LABELS[platform] ?? [];

          return (
            <div key={platform} className="rounded-xl border border-gray-warm bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-ui text-sm font-semibold text-charcoal">{PLATFORM_LABELS[platform]}</span>
                <span className={`rounded-full border px-2 py-0.5 font-ui text-[10px] uppercase tracking-[0.14em] ${isConnected ? "border-green-200 bg-green-50 text-green-700" : "border-gray-200 bg-gray-50 text-gray-400"}`}>
                  {isConnected ? "Connected" : "Not connected"}
                </span>
              </div>
              {!isConnected ? (
                <p className="font-ui text-xs text-gray-mid">Connect this account in Settings to see analytics.</p>
              ) : (
                <div className="space-y-2">
                  {metricLabels.map((label) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="font-ui text-xs text-gray-mid">{label}</span>
                      <span className="font-ui text-xs font-semibold text-charcoal">—</span>
                    </div>
                  ))}
                  <p className="pt-1 font-ui text-[10px] text-gray-mid">Live analytics coming soon.</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Settings Tab ──────────────────────────────────────────────────────────

const PLATFORM_CONFIG: {
  id: string;
  label: string;
  description: string;
  oauth: boolean;
  authHref: string;
}[] = [
  { id: "instagram", label: "Instagram", description: "Publish photos and reels to your business profile.", oauth: true, authHref: "/api/admin/social/auth/instagram" },
  { id: "facebook", label: "Facebook", description: "Post to your business page feed.", oauth: true, authHref: "/api/admin/social/auth/facebook" },
  { id: "pinterest", label: "Pinterest", description: "Pin project photos to your boards.", oauth: false, authHref: "" },
  { id: "youtube", label: "YouTube", description: "Upload project videos and shorts.", oauth: false, authHref: "" },
];

function SettingsTab({ accounts, onAccountsChange }: { accounts: SocialAccount[]; onAccountsChange: () => void }) {
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  const accountMap = Object.fromEntries(accounts.map((a) => [a.platform, a]));

  async function disconnect(platform: string) {
    setDisconnecting(platform);
    await fetch(`/api/admin/social/accounts/${platform}`, { method: "DELETE" });
    setDisconnecting(null);
    onAccountsChange();
  }

  return (
    <div className="mt-6 max-w-2xl space-y-8">
      {/* Platform connections */}
      <div>
        <h2 className="mb-4 font-ui text-sm font-semibold uppercase tracking-[0.14em] text-gray-mid">Connected Accounts</h2>
        <div className="space-y-3">
          {PLATFORM_CONFIG.map(({ id, label, description, oauth, authHref }) => {
            const account = accountMap[id];
            const isConnected = account?.connected;

            return (
              <div key={id} className="flex items-start justify-between gap-4 rounded-xl border border-gray-warm bg-white p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-ui text-sm font-semibold text-charcoal">{label}</span>
                    {isConnected && account.accountName ? (
                      <span className="font-ui text-xs text-gray-mid">@{account.accountName}</span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 font-ui text-xs text-gray-mid">{description}</p>
                  {isConnected && account.connectedAt ? (
                    <p className="mt-1 font-ui text-[10px] text-gray-mid">
                      Connected {new Date(account.connectedAt).toLocaleDateString()}
                    </p>
                  ) : null}
                </div>
                <div className="shrink-0">
                  {!oauth ? (
                    <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 font-ui text-xs text-gray-400">Coming soon</span>
                  ) : isConnected ? (
                    <button
                      type="button"
                      onClick={() => void disconnect(id)}
                      disabled={disconnecting === id}
                      className="rounded-lg border border-gray-warm px-3 py-1.5 font-ui text-xs text-gray-mid transition hover:border-red hover:text-red disabled:opacity-50"
                    >
                      {disconnecting === id ? "..." : "Disconnect"}
                    </button>
                  ) : (
                    <a
                      href={authHref}
                      className="inline-block rounded-lg bg-navy px-3 py-1.5 font-ui text-xs text-white transition hover:bg-navy/90"
                    >
                      Connect
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Post defaults */}
      <div>
        <h2 className="mb-4 font-ui text-sm font-semibold uppercase tracking-[0.14em] text-gray-mid">Post Defaults</h2>
        <div className="rounded-xl border border-gray-warm bg-white p-4 space-y-3">
          {[
            { id: "auto-hashtags", label: "Auto-append hashtags", description: "Append default brand hashtags to every post." },
            { id: "link-in-bio", label: "Link in bio reminder", description: "Add 'link in bio' callout to Instagram captions." },
          ].map(({ id, label, description }) => (
            <label key={id} className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-gray-warm accent-navy" />
              <div>
                <p className="font-ui text-sm text-charcoal">{label}</p>
                <p className="font-ui text-xs text-gray-mid">{description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Cron info */}
      <div>
        <h2 className="mb-4 font-ui text-sm font-semibold uppercase tracking-[0.14em] text-gray-mid">Automation</h2>
        <div className="rounded-xl border border-gray-warm bg-gray-50 p-4">
          <p className="font-ui text-xs text-charcoal">Scheduled posts are published automatically via the cron endpoint:</p>
          <code className="mt-1 block font-mono text-xs text-gray-mid">GET /api/cron/social</code>
          <p className="mt-2 font-ui text-xs text-gray-mid">Set up a Railway cron or external scheduler to call this endpoint with <code className="font-mono">Authorization: Bearer CRON_SECRET</code> every 5–15 minutes.</p>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────

export default function SocialHubPage() {
  const [tab, setTab] = useState<Tab>("queue");
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);

  const loadAccounts = useCallback(async () => {
    const res = await fetch("/api/admin/social/accounts");
    if (!res.ok) return;
    const data = (await res.json()) as { accounts: SocialAccount[] };
    setAccounts(data.accounts ?? []);
  }, []);

  useEffect(() => { void loadAccounts(); }, [loadAccounts]);

  return (
    <main className="bg-cream px-4 pb-16 pt-8 md:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mt-8 text-4xl text-charcoal">Social</h1>
        <p className="mt-1 font-ui text-sm text-gray-mid">Schedule and manage posts across all platforms.</p>

        <div className="mt-6">
          <TabBar active={tab} onSelect={setTab} />

          {tab === "queue" && <QueueTab accounts={accounts} />}
          {tab === "composer" && <ComposerTab accounts={accounts} />}
          {tab === "calendar" && <CalendarTab />}
          {tab === "analytics" && <AnalyticsTab accounts={accounts} />}
          {tab === "settings" && <SettingsTab accounts={accounts} onAccountsChange={loadAccounts} />}
        </div>
      </div>
    </main>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import PostToGBPButton from "@/components/admin/PostToGBPButton";

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

        {/* Quick publish row */}
        {caption.trim().length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
            <p className="w-full font-ui text-xs text-gray-400">Publish to:</p>
            <PostToGBPButton caption={caption} />
            <button
              type="button"
              onClick={async () => {
                const imageUrl = mediaUrls[0];
                if (imageUrl && process.env.NEXT_PUBLIC_META_CONFIGURED === "true") {
                  const res = await fetch("/api/admin/social/post-instagram", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ imageUrl, caption }),
                  });
                  if (res.ok) { alert("Posted to Instagram!"); return; }
                }
                navigator.clipboard.writeText(caption).catch(() => null);
                window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
              }}
              className="flex items-center gap-2 rounded-lg px-4 py-2 font-ui text-sm font-medium text-white"
              style={{ background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)" }}
            >
              📸 {process.env.NEXT_PUBLIC_META_CONFIGURED === "true" ? "Post to Instagram" : "Copy for Instagram"}
            </button>
            <button
              type="button"
              onClick={async () => {
                const imageUrl = mediaUrls[0];
                if (imageUrl && process.env.NEXT_PUBLIC_META_CONFIGURED === "true") {
                  const res = await fetch("/api/admin/social/post-facebook", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ imageUrl, caption }),
                  });
                  if (res.ok) { alert("Posted to Facebook!"); return; }
                }
                navigator.clipboard.writeText(caption).catch(() => null);
                window.open("https://www.facebook.com/sublimedesignnv", "_blank", "noopener,noreferrer");
              }}
              className="flex items-center gap-2 rounded-lg px-4 py-2 font-ui text-sm font-medium text-white"
              style={{ backgroundColor: "#1877F2" }}
            >
              👍 {process.env.NEXT_PUBLIC_META_CONFIGURED === "true" ? "Post to Facebook" : "Copy for Facebook"}
            </button>
          </div>
        )}
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function SettingsTab({ accounts: _accounts, onAccountsChange: _onAccountsChange }: { accounts: SocialAccount[]; onAccountsChange: () => void }) {
  const metaConfigured = process.env.NEXT_PUBLIC_META_CONFIGURED === "true";

  return (
    <div className="mt-6 max-w-2xl space-y-8">
      {/* Platform connections */}
      <div>
        <h2 className="mb-4 font-ui text-sm font-semibold uppercase tracking-[0.14em] text-gray-mid">Connected Accounts</h2>
        <div className="space-y-3">

          {/* Instagram */}
          <div className="flex items-center justify-between rounded-xl border border-gray-warm bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
              <div>
                <p className="font-ui text-sm font-semibold text-charcoal">Instagram</p>
                <p className="font-ui text-xs text-gray-mid">
                  {metaConfigured ? "@sublime_design_nv · Connected" : "Publish photos to your business profile"}
                </p>
              </div>
            </div>
            {metaConfigured ? (
              <span className="rounded-full bg-green-50 px-3 py-1 font-ui text-xs font-semibold text-green-700">✓ Connected</span>
            ) : (
              <a href="https://business.facebook.com/settings/system-users" target="_blank" rel="noopener noreferrer" className="rounded-lg px-4 py-2 font-ui text-sm font-semibold text-white" style={{ backgroundColor: "#1B2A6B" }}>
                Connect →
              </a>
            )}
          </div>

          {/* Facebook */}
          <div className="flex items-center justify-between rounded-xl border border-gray-warm bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: "#1877F2" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <div>
                <p className="font-ui text-sm font-semibold text-charcoal">Facebook</p>
                <p className="font-ui text-xs text-gray-mid">
                  {metaConfigured ? "Sublime Design NV · Connected" : "Post to your business page feed"}
                </p>
              </div>
            </div>
            {metaConfigured ? (
              <span className="rounded-full bg-green-50 px-3 py-1 font-ui text-xs font-semibold text-green-700">✓ Connected</span>
            ) : (
              <a href="https://business.facebook.com/settings/system-users" target="_blank" rel="noopener noreferrer" className="rounded-lg px-4 py-2 font-ui text-sm font-semibold text-white" style={{ backgroundColor: "#1877F2" }}>
                Connect →
              </a>
            )}
          </div>

          {/* Google Business Profile */}
          <div className="flex items-center justify-between rounded-xl border border-gray-warm bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              <div>
                <p className="font-ui text-sm font-semibold text-charcoal">Google Business Profile</p>
                <p className="font-ui text-xs text-gray-mid">Copy caption + open GBP composer</p>
              </div>
            </div>
            <span className="rounded-full bg-green-50 px-3 py-1 font-ui text-xs font-semibold text-green-700">✓ Ready</span>
          </div>

          {/* Pinterest — coming soon */}
          <div className="flex items-center justify-between rounded-xl border border-gray-warm bg-white p-4 opacity-50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: "#E60023" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                </svg>
              </div>
              <div>
                <p className="font-ui text-sm font-semibold text-charcoal">Pinterest</p>
                <p className="font-ui text-xs text-gray-mid">Coming soon</p>
              </div>
            </div>
            <span className="rounded-full bg-gray-100 px-3 py-1 font-ui text-xs text-gray-400">Soon</span>
          </div>

        </div>

        {/* Setup instructions when not configured */}
        {!metaConfigured && (
          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="font-ui text-sm font-semibold text-blue-900 mb-2">How to connect Instagram &amp; Facebook</p>
            <ol className="list-decimal list-inside space-y-1 font-ui text-xs text-blue-800">
              <li>Go to business.facebook.com → Settings → System Users</li>
              <li>Create a System User with Admin role</li>
              <li>Generate a token with <code className="font-mono">instagram_content_publish</code> + <code className="font-mono">pages_manage_posts</code> scopes</li>
              <li>Get your Instagram Account ID and Facebook Page ID</li>
              <li>Add <code className="font-mono">META_SYSTEM_USER_TOKEN</code>, <code className="font-mono">META_INSTAGRAM_ACCOUNT_ID</code>, <code className="font-mono">META_FACEBOOK_PAGE_ID</code> to Vercel env vars</li>
              <li>Set <code className="font-mono">NEXT_PUBLIC_META_CONFIGURED=true</code> in Vercel</li>
            </ol>
            <a href="https://business.facebook.com/settings/system-users" target="_blank" rel="noopener noreferrer" className="mt-3 inline-block font-ui text-xs font-semibold text-blue-700 underline">
              Open Meta Business Suite →
            </a>
          </div>
        )}
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

      {/* Pinterest board manager */}
      <div>
        <h2 className="mb-4 font-ui text-sm font-semibold uppercase tracking-[0.14em] text-gray-mid">Pinterest Boards</h2>
        <div className="rounded-xl border border-gray-warm bg-white p-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-ui text-sm text-charcoal">Manage boards and map them to services for auto-selection when composing pins.</p>
            <p className="mt-0.5 font-ui text-xs text-gray-mid">Connect Pinterest above, then sync your boards and set defaults.</p>
          </div>
          <a href="/admin/social/pinterest" className="shrink-0 rounded-lg border border-gray-warm px-4 py-2 font-ui text-sm text-charcoal transition hover:border-navy hover:text-navy">
            Manage Boards →
          </a>
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

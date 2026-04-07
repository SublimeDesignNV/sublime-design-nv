"use client";

import { useCallback, useEffect, useState } from "react";

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
  project: { id: string; title: string; slug: string };
};

export default function SocialQueuePage() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const response = await fetch("/api/admin/social/schedule");
    setIsLoading(false);
    if (!response.ok) {
      setError("Failed to load posts.");
      return;
    }
    const data = (await response.json()) as { posts: ScheduledPost[] };
    setPosts(data.posts ?? []);
  }, []);

  useEffect(() => { void loadPosts(); }, [loadPosts]);

  async function cancelPost(id: string) {
    await fetch(`/api/admin/social/${id}/cancel`, { method: "PATCH" });
    await loadPosts();
  }

  async function retryPost(id: string) {
    await fetch("/api/admin/social/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: id }),
    });
    await loadPosts();
  }

  const filtered = posts
    .filter((p) => !filterStatus || p.status === filterStatus)
    .filter((p) => !filterPlatform || p.platform === filterPlatform || (filterPlatform === "both" && p.platform === "both"));

  const statusCounts = {
    pending: posts.filter((p) => p.status === "pending").length,
    posted: posts.filter((p) => p.status === "posted").length,
    failed: posts.filter((p) => p.status === "failed").length,
    cancelled: posts.filter((p) => p.status === "cancelled").length,
  };

  const statusColors: Record<string, string> = {
    pending: "text-blue-700 bg-blue-50 border-blue-200",
    posted: "text-green-700 bg-green-50 border-green-200",
    failed: "text-red bg-red/5 border-red/20",
    cancelled: "text-gray-mid bg-gray-50 border-gray-200",
  };

  const statusIcons: Record<string, string> = {
    pending: "⏱",
    posted: "✓",
    failed: "✗",
    cancelled: "—",
  };

  return (
    <main className="bg-cream px-4 pb-16 pt-8 md:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mt-8 text-4xl text-charcoal">Social Queue</h1>

        {/* Stats */}
        <div className="mt-4 flex flex-wrap gap-4">
          {(Object.entries(statusCounts) as [string, number][]).map(([status, count]) => (
            <div key={status} className="flex items-baseline gap-1.5">
              <span className={`font-ui text-lg font-semibold ${status === "failed" ? "text-red" : status === "posted" ? "text-green-700" : status === "pending" ? "text-blue-700" : "text-gray-mid"}`}>{count}</span>
              <span className="font-ui text-xs uppercase tracking-[0.14em] text-gray-mid capitalize">{status}</span>
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
            <option value="both">Both</option>
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
                  <div className="flex flex-wrap items-start gap-3">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-ui text-[10px] uppercase tracking-[0.14em] ${statusColors[post.status] ?? ""}`}>
                      {statusIcons[post.status]} {post.status}
                    </span>
                    <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 font-ui text-[10px] uppercase tracking-[0.14em] text-gray-mid capitalize">
                      {post.platform}
                    </span>
                    <span className="font-ui text-xs text-gray-mid">{when}</span>
                    <a href={`/admin/projects`} className="font-ui text-xs text-navy hover:text-red">
                      {post.project.title}
                    </a>
                    <div className="ml-auto flex gap-2">
                      {post.status === "pending" ? (
                        <button type="button" onClick={() => void cancelPost(post.id)} className="font-ui text-xs text-gray-mid transition hover:text-red">Cancel</button>
                      ) : null}
                      {post.status === "failed" ? (
                        <button type="button" onClick={() => void retryPost(post.id)} className="font-ui text-xs text-navy transition hover:text-red">Retry</button>
                      ) : null}
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm text-charcoal">{post.caption}</p>
                  {post.errorMessage ? (
                    <p className="mt-2 font-ui text-xs text-red">{post.errorMessage}</p>
                  ) : null}
                </article>
              );
            })}
            {!filtered.length ? (
              <p className="font-ui text-sm text-gray-mid">
                {posts.length > 0 ? "No posts match the current filters." : "No social posts yet. Open a project and click Social to get started."}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </main>
  );
}

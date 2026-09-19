import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { CategoryFilter } from "../components/CategoryFilter";
import { FeedControls } from "../components/FeedControls";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { NewStoryModal } from "../components/NewStoryModal";
import { ReportModal, type ReportTarget } from "../components/ReportModal";
import { StoryCard } from "../components/StoryCard";
import type { PostSummary, ReactionKind, SortOption } from "../types";

export function HomePage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [healthOk, setHealthOk] = useState(true);
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  const loadFeed = useCallback(async (nextPage: number, replace: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        category,
        sort,
        page: String(nextPage),
        page_size: "8",
      });
      if (debouncedQuery) params.set("q", debouncedQuery);
      const data = await api.getPosts(params);
      setPosts((current) => (replace ? data.items : [...current, ...data.items]));
      setHasMore(data.has_more);
      setPage(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stories");
    } finally {
      setLoading(false);
    }
  }, [category, sort, debouncedQuery]);

  useEffect(() => {
    void loadFeed(1, true);
  }, [loadFeed]);

  useEffect(() => {
    void api
      .getHealth()
      .then((health) => setHealthOk(health.status === "ok"))
      .catch(() => setHealthOk(false));
  }, []);

  const empty = useMemo(() => !loading && posts.length === 0, [loading, posts.length]);

  async function handleReact(postId: string, kind: ReactionKind) {
    try {
      const result = await api.toggleReaction(postId, kind);
      setPosts((current) =>
        current.map((post) => {
          if (post.id !== postId) return post;
          return {
            ...post,
            stand_with_count: result.stand_with_count,
            this_helped_count: result.this_helped_count,
            visitor_stood_with:
              kind === "stand_with" ? result.active : post.visitor_stood_with,
            visitor_marked_helped:
              kind === "this_helped" ? result.active : post.visitor_marked_helped,
          };
        }),
      );
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Could not update reaction");
    }
  }

  function handleReport(post: PostSummary) {
    setReportTarget({
      id: post.id,
      title: post.title,
      preview: post.content,
    });
  }

  function handleReported(postId: string, hidden: boolean) {
    if (hidden) {
      setPosts((current) => current.filter((post) => post.id !== postId));
    }
  }

  return (
    <div className="min-h-screen pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <Header onNewStory={() => setModalOpen(true)} healthOk={healthOk} />
      <Hero onNewStory={() => setModalOpen(true)} />

      <main id="stories" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-6 max-w-2xl sm:mb-8">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">The circle</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Ask for guidance. Share a lesson from home, work, or marriage. Sisters reply with
            practical care — not judgment.
          </p>
        </div>

        <div className="space-y-4">
          <CategoryFilter
            value={category}
            onChange={(value) => {
              setCategory(value);
            }}
          />
          <FeedControls
            query={query}
            sort={sort}
            onQueryChange={setQuery}
            onSortChange={setSort}
          />
        </div>

        {error ? <p className="mt-8 text-sm text-danger">{error}</p> : null}

        <div className="mt-8 grid gap-4">
          {posts.map((post, index) => (
            <div
              key={post.id}
              className="animate-fade-up"
              style={{ animationDelay: `${Math.min(index, 6) * 40}ms` }}
            >
              <StoryCard post={post} onReact={handleReact} onReport={handleReport} />
            </div>
          ))}
        </div>

        {empty ? (
          <p className="mt-10 rounded-2xl border border-dashed border-border bg-surface/70 p-8 text-center text-muted">
            No posts match that filter yet. Be the first to ask the circle.
          </p>
        ) : null}

        {hasMore ? (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              disabled={loading}
              onClick={() => void loadFeed(page + 1, false)}
              className="rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-medium text-ink hover:border-ink/30 disabled:opacity-60"
            >
              {loading ? "Loading…" : "Load more"}
            </button>
          </div>
        ) : null}
      </main>

      <Footer />
      <NewStoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(id) => navigate(`/stories/${id}`)}
      />
      <ReportModal
        target={reportTarget}
        onClose={() => setReportTarget(null)}
        onReported={handleReported}
      />

      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-surface shadow-lg md:hidden"
      >
        New post
      </button>
    </div>
  );
}

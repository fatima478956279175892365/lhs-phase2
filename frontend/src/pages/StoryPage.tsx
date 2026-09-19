import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Flag, HeartHandshake } from "lucide-react";
import { api } from "../api";
import { CommentSection } from "../components/CommentSection";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { NewStoryModal } from "../components/NewStoryModal";
import { ReportModal, type ReportTarget } from "../components/ReportModal";
import type { PostDetail, ReactionKind } from "../types";
import { categoryLabel, categoryTone, formatRelativeTime, readingMinutes } from "../utils";

export function StoryPage() {
  const { id = "" } = useParams();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const [healthOk, setHealthOk] = useState(true);

  useEffect(() => {
    void api
      .getHealth()
      .then((health) => setHealthOk(health.status === "ok"))
      .catch(() => setHealthOk(false));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    void api
      .getPost(id)
      .then((data) => {
        if (!cancelled) setPost(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Story not found");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleReact(kind: ReactionKind) {
    if (!post) return;
    try {
      const result = await api.toggleReaction(post.id, kind);
      setPost({
        ...post,
        stand_with_count: result.stand_with_count,
        this_helped_count: result.this_helped_count,
        visitor_stood_with: kind === "stand_with" ? result.active : post.visitor_stood_with,
        visitor_marked_helped: kind === "this_helped" ? result.active : post.visitor_marked_helped,
      });
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Could not update reaction");
    }
  }

  function openReportModal() {
    if (!post) return;
    setReportTarget({
      id: post.id,
      title: post.title,
      preview: post.content,
    });
  }

  function handleReported(_postId: string, hidden: boolean) {
    if (hidden) {
      setPost(null);
      setError("This post was hidden while our team reviews it.");
    }
  }

  return (
    <div className="min-h-screen">
      <Header onNewStory={() => setModalOpen(true)} healthOk={healthOk} />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <Link to="/#stories" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
          <ArrowLeft className="size-4" />
          Back to stories
        </Link>

        {error ? <p className="mt-10 text-danger">{error}</p> : null}

        {post ? (
          <article className="mt-6 sm:mt-8">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`rounded-full px-2.5 py-1 font-medium ${categoryTone(post.category)}`}>
                {categoryLabel(post.category)}
              </span>
              <span className="text-muted">
                {formatRelativeTime(post.created_at)} · {readingMinutes(post.content)} min read
              </span>
            </div>

            {post.title ? (
              <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight break-words text-ink sm:mt-5 sm:text-4xl md:text-5xl">
                {post.title}
              </h1>
            ) : (
              <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:mt-5 sm:text-4xl">
                A shared story
              </h1>
            )}

            <p className="mt-3 text-sm text-muted">by {post.author_name}</p>
            <p className="mt-6 text-[16px] leading-7 break-words text-ink-soft whitespace-pre-wrap sm:mt-8 sm:text-[17px] sm:leading-8">
              {post.content}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void handleReact("stand_with")}
                className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 py-2 text-sm ${
                  post.visitor_stood_with
                    ? "border-accent-warm bg-accent-warm text-surface"
                    : "border-border bg-surface text-ink-soft"
                }`}
              >
                <HeartHandshake className="size-4 shrink-0" />
                <span className="sm:hidden">Stand · {post.stand_with_count}</span>
                <span className="hidden sm:inline">Stand with her · {post.stand_with_count}</span>
              </button>
              <button
                type="button"
                onClick={() => void handleReact("this_helped")}
                className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 py-2 text-sm ${
                  post.visitor_marked_helped
                    ? "border-accent bg-accent text-surface"
                    : "border-border bg-surface text-ink-soft"
                }`}
              >
                This helped · {post.this_helped_count}
              </button>
              <button
                type="button"
                onClick={openReportModal}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 py-2 text-sm text-muted hover:text-danger sm:ml-auto"
              >
                <Flag className="size-4" />
                Report
              </button>
            </div>

            <CommentSection
              postId={post.id}
              comments={post.comments}
              onCommentsChange={(comments) =>
                setPost({ ...post, comments, comment_count: comments.length })
              }
            />
          </article>
        ) : null}
      </main>
      <Footer />
      <NewStoryModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={() => setModalOpen(false)} />
      <ReportModal
        target={reportTarget}
        onClose={() => setReportTarget(null)}
        onReported={handleReported}
      />
    </div>
  );
}

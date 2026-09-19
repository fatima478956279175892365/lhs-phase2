import { Flag, HeartHandshake, MessageCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import type { PostSummary, ReactionKind } from "../types";
import { categoryLabel, categoryTone, formatRelativeTime, readingMinutes } from "../utils";

interface StoryCardProps {
  post: PostSummary;
  onReact: (postId: string, kind: ReactionKind) => void;
  onReport: (post: PostSummary) => void;
}

export function StoryCard({ post, onReact, onReport }: StoryCardProps) {
  return (
    <article className="story-surface overflow-hidden rounded-2xl p-4 transition duration-300 sm:p-6">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className={`rounded-full px-2.5 py-1 font-medium ${categoryTone(post.category)}`}>
          {categoryLabel(post.category)}
        </span>
        {post.featured ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 font-medium text-surface">
            <Sparkles className="size-3" />
            Featured
          </span>
        ) : null}
        <span className="text-muted">
          {formatRelativeTime(post.created_at)} · {readingMinutes(post.content)} min read
        </span>
      </div>

      <Link to={`/stories/${post.id}`} className="mt-3 block group sm:mt-4">
        {post.title ? (
          <h3 className="font-display text-xl font-semibold tracking-tight break-words text-ink group-hover:text-accent sm:text-2xl">
            {post.title}
          </h3>
        ) : null}
        <p
          className={`text-[15px] leading-relaxed break-words text-ink-soft whitespace-pre-wrap ${
            post.title ? "mt-2 sm:mt-3" : ""
          }`}
        >
          {post.content.length > 420 ? `${post.content.slice(0, 420).trim()}…` : post.content}
        </p>
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
        <span className="min-w-0 truncate">by {post.author_name}</span>
        <Link to={`/stories/${post.id}`} className="shrink-0 text-accent hover:underline">
          Open story
        </Link>
      </div>

      {post.preview_comments.length > 0 ? (
        <div className="mt-4 space-y-2 border-t border-border/70 pt-4">
          {post.preview_comments.map((comment) => (
            <p key={comment.id} className="text-sm break-words text-ink-soft">
              <span className="font-medium text-ink">{comment.author_name}</span>
              <span className="text-muted"> · </span>
              {comment.content}
            </p>
          ))}
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onReact(post.id, "stand_with")}
          className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 py-2 text-sm transition ${
            post.visitor_stood_with
              ? "border-accent-warm bg-accent-warm text-surface"
              : "border-border bg-surface text-ink-soft hover:border-accent-warm/40"
          }`}
        >
          <HeartHandshake className="size-4 shrink-0" />
          <span className="sm:hidden">Stand · {post.stand_with_count}</span>
          <span className="hidden sm:inline">Stand with her · {post.stand_with_count}</span>
        </button>
        <button
          type="button"
          onClick={() => onReact(post.id, "this_helped")}
          className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 py-2 text-sm transition ${
            post.visitor_marked_helped
              ? "border-accent bg-accent text-surface"
              : "border-border bg-surface text-ink-soft hover:border-accent/40"
          }`}
        >
          This helped · {post.this_helped_count}
        </button>
        <Link
          to={`/stories/${post.id}#comments`}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-2 text-sm text-ink-soft hover:border-ink/30"
        >
          <MessageCircle className="size-4" />
          {post.comment_count}
        </Link>
        <button
          type="button"
          onClick={() => onReport(post)}
          className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full px-2 py-2 text-sm text-muted hover:text-danger sm:ml-auto"
          aria-label="Report post"
        >
          <Flag className="size-4" />
        </button>
      </div>
    </article>
  );
}

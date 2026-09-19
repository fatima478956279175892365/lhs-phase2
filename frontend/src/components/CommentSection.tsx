import { useState } from "react";
import type { Comment } from "../types";
import { api } from "../api";
import { formatRelativeTime } from "../utils";

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  onCommentsChange: (comments: Comment[]) => void;
}

export function CommentSection({ postId, comments, onCommentsChange }: CommentSectionProps) {
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const comment = await api.createComment(postId, {
        content: content.trim(),
        author_name: authorName.trim() || undefined,
      });
      onCommentsChange([...comments, comment]);
      setContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post comment");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="comments" className="mt-10">
      <h2 className="font-display text-3xl font-semibold text-ink">Replies</h2>
      <p className="mt-2 text-sm text-muted">Offer a script, a lesson, or solidarity — not judgment.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3 rounded-2xl border border-border bg-surface p-4">
        <input
          value={authorName}
          onChange={(event) => setAuthorName(event.target.value)}
          placeholder="Name (optional)"
          className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-accent/50"
        />
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          required
          minLength={2}
          rows={3}
          placeholder="Write a reply…"
          className="w-full resize-y rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-accent/50"
        />
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-surface disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Reply"}
        </button>
      </form>

      <ul className="mt-6 space-y-4">
        {comments.map((comment) => (
          <li key={comment.id} className="rounded-2xl border border-border/80 bg-surface/80 p-4">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-ink">{comment.author_name}</span>
              <span className="text-muted">{formatRelativeTime(comment.created_at)}</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft whitespace-pre-wrap">{comment.content}</p>
          </li>
        ))}
        {comments.length === 0 ? (
          <li className="text-sm text-muted">No replies yet. Be the first to stand with her.</li>
        ) : null}
      </ul>
    </section>
  );
}

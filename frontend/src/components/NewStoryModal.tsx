import { useEffect, useId, useState } from "react";
import { X } from "lucide-react";
import { CATEGORIES } from "../types";
import { api } from "../api";

interface NewStoryModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (id: string) => void;
}

export function NewStoryModal({ open, onClose, onCreated }: NewStoryModalProps) {
  const titleId = useId();
  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [category, setCategory] = useState("seeking-advice");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const post = await api.createPost({
        title: title.trim() || undefined,
        author_name: authorName.trim() || undefined,
        category,
        content: content.trim(),
      });
      setTitle("");
      setAuthorName("");
      setContent("");
      setCategory("seeking-advice");
      onCreated(post.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not publish post");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 max-h-[min(92vh,100dvh)] w-full max-w-xl overflow-y-auto overscroll-contain rounded-t-3xl bg-surface p-5 shadow-2xl sm:rounded-3xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="font-display text-2xl font-semibold text-ink sm:text-3xl">
              Ask or share
            </h2>
            <p className="mt-2 text-sm text-muted">
              Seek guidance, post a lesson, or open up about work, home, or marriage. Anonymous by default.
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-border p-2 text-muted">
            <X className="size-4" />
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted">Title (optional)</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 outline-none focus:border-accent/50"
              maxLength={160}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1.5 block text-muted">Display name</span>
              <input
                value={authorName}
                onChange={(event) => setAuthorName(event.target.value)}
                placeholder="Anonymous"
                className="w-full rounded-xl border border-border bg-white px-3 py-2.5 outline-none focus:border-accent/50"
                maxLength={80}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-muted">Category</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full rounded-xl border border-border bg-white px-3 py-2.5 outline-none focus:border-accent/50"
              >
                {CATEGORIES.filter((item) => item.id !== "all").map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block text-sm">
            <span className="mb-1.5 block text-muted">Your post</span>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              required
              rows={8}
              minLength={20}
              maxLength={5000}
              className="w-full resize-y rounded-xl border border-border bg-white px-3 py-2.5 outline-none focus:border-accent/50"
              placeholder="What do you need guidance on — or what lesson are you sharing?"
            />
          </label>

          {error ? <p className="text-sm text-danger">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-accent px-4 py-3 text-sm font-semibold text-surface transition hover:bg-accent-dark disabled:opacity-60"
          >
            {submitting ? "Posting…" : "Post to the circle"}
          </button>
        </form>
      </div>
    </div>
  );
}

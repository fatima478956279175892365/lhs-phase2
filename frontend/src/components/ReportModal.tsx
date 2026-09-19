import { useEffect, useId, useState } from "react";
import { CheckCircle2, Flag, X } from "lucide-react";
import { api } from "../api";

export type ReportCategory = "harassment" | "personal-info" | "harmful" | "spam" | "other";

export interface ReportTarget {
  id: string;
  title: string | null;
  preview: string;
}

interface ReportModalProps {
  target: ReportTarget | null;
  onClose: () => void;
  onReported: (postId: string, hidden: boolean) => void;
}

const REASONS: { id: ReportCategory; label: string; hint: string }[] = [
  {
    id: "harassment",
    label: "Harassment or bullying",
    hint: "Targeting, insults, or intimidation",
  },
  {
    id: "personal-info",
    label: "Personal or identifying information",
    hint: "Names, addresses, phone numbers, or doxxing",
  },
  {
    id: "harmful",
    label: "Harmful or unsafe content",
    hint: "Content that could put someone at risk",
  },
  {
    id: "spam",
    label: "Spam or off-topic",
    hint: "Not a genuine community post",
  },
  {
    id: "other",
    label: "Something else",
    hint: "Use the notes field below",
  },
];

type Step = "form" | "success" | "already";

export function ReportModal({ target, onClose, onReported }: ReportModalProps) {
  const titleId = useId();
  const [category, setCategory] = useState<ReportCategory>("harmful");
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [message, setMessage] = useState("");
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!target) return;
    setCategory("harmful");
    setDetails("");
    setError(null);
    setSubmitting(false);
    setStep("form");
    setMessage("");
    setHidden(false);
  }, [target]);

  useEffect(() => {
    if (!target) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [target, submitting, onClose]);

  if (!target) return null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await api.reportPost(target!.id, {
        category,
        details: details.trim() || undefined,
      });
      setMessage(result.message);
      setHidden(result.hidden);
      setStep(result.already_reported ? "already" : "success");
      if (!result.already_reported) {
        onReported(target!.id, result.hidden);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send report");
    } finally {
      setSubmitting(false);
    }
  }

  const preview = target.preview.length > 140 ? `${target.preview.slice(0, 140).trim()}…` : target.preview;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 max-h-[min(92vh,100dvh)] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-3xl bg-surface p-5 shadow-2xl sm:rounded-3xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-accent-soft p-2 text-accent">
              <Flag className="size-5" />
            </div>
            <div>
              <h2 id={titleId} className="font-display text-2xl font-semibold text-ink">
                Report this post
              </h2>
              <p className="mt-1 text-sm text-muted">
                Reports go to our moderation team. You can only report a post once.
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-border p-2 text-muted">
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-border bg-white/70 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">Post being reported</p>
          {target.title ? (
            <p className="mt-1 font-medium text-ink">{target.title}</p>
          ) : null}
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">{preview}</p>
        </div>

        {step === "form" ? (
          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-ink">Why are you reporting this?</legend>
              {REASONS.map((reason) => (
                <label
                  key={reason.id}
                  className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition ${
                    category === reason.id
                      ? "border-accent bg-accent-soft/60"
                      : "border-border bg-white hover:border-accent/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="report-category"
                    value={reason.id}
                    checked={category === reason.id}
                    onChange={() => setCategory(reason.id)}
                    className="mt-1"
                  />
                  <span>
                    <span className="block text-sm font-medium text-ink">{reason.label}</span>
                    <span className="block text-xs text-muted">{reason.hint}</span>
                  </span>
                </label>
              ))}
            </fieldset>

            <label className="block text-sm">
              <span className="mb-1.5 block text-muted">Additional details (optional)</span>
              <textarea
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                rows={3}
                maxLength={280}
                placeholder="Anything else that helps our team review this safely…"
                className="w-full resize-y rounded-xl border border-border bg-white px-3 py-2.5 outline-none focus:border-accent/50"
              />
            </label>

            {error ? <p className="text-sm text-danger">{error}</p> : null}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-border px-4 py-2.5 text-sm font-medium text-ink-soft"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-surface disabled:opacity-60"
              >
                {submitting ? "Sending…" : "Submit report"}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6 rounded-2xl border border-border bg-white/70 p-5 text-center">
            <CheckCircle2 className="mx-auto size-10 text-accent" />
            <p className="mt-3 font-medium text-ink">
              {step === "already" ? "Already reported" : "Report received"}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{message}</p>
            {hidden ? (
              <p className="mt-3 text-sm text-ink-soft">
                This post is now hidden from the feed while it&apos;s reviewed.
              </p>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="mt-5 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-surface"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

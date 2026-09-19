import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { api } from "../api";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { NewStoryModal } from "../components/NewStoryModal";
import type { SafetyResource } from "../types";

export function SafetyPage() {
  const [resources, setResources] = useState<SafetyResource[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [healthOk, setHealthOk] = useState(true);

  useEffect(() => {
    void api.getSafety().then(setResources).catch(() => setResources([]));
    void api
      .getHealth()
      .then((health) => setHealthOk(health.status === "ok"))
      .catch(() => setHealthOk(false));
  }, []);

  return (
    <div className="min-h-screen">
      <Header onNewStory={() => setModalOpen(true)} healthOk={healthOk} />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
          <ArrowLeft className="size-4" />
          Home
        </Link>
        <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight text-ink sm:mt-6 sm:text-4xl md:text-5xl">
          Safety & care
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-soft sm:text-base">
          This community is for support, not crisis response. If you or someone else is in immediate
          danger, contact local emergency services first. The links below are starting points — verify
          them for your region.
        </p>

        <ul className="mt-10 space-y-4">
          {resources.map((resource) => (
            <li key={resource.title} className="story-surface rounded-2xl p-5">
              <div className="text-xs uppercase tracking-[0.14em] text-muted">{resource.region}</div>
              <h2 className="mt-2 font-display text-2xl font-semibold text-ink">{resource.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{resource.description}</p>
              {resource.url ? (
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
                >
                  Open resource
                  <ExternalLink className="size-4" />
                </a>
              ) : null}
            </li>
          ))}
        </ul>

        <section className="mt-12 rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-display text-2xl font-semibold text-ink">Community guidelines</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-soft">
            <li>Share your truth without naming private individuals when possible.</li>
            <li>No harassment, doxxing, or graphic exploitation of others&apos; trauma.</li>
            <li>Reports are reviewed; repeated flags can auto-hide a story pending moderation.</li>
            <li>Offer resources and solidarity in comments — not unsolicited diagnosis.</li>
          </ul>
        </section>
      </main>
      <Footer />
      <NewStoryModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={() => setModalOpen(false)} />
    </div>
  );
}

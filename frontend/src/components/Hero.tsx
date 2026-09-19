interface HeroProps {
  onNewStory: () => void;
}

export function Hero({ onNewStory }: HeroProps) {
  return (
    <section className="relative isolate overflow-hidden border-b border-border">
      <div className="absolute inset-0 bg-gradient-to-br from-[#e6efed] via-surface to-[#ebe6dd]" />
      <div className="absolute -left-20 top-0 h-56 w-56 rounded-full bg-accent/10 blur-3xl sm:h-72 sm:w-72" />
      <div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-accent-warm/10 blur-3xl sm:h-80 sm:w-80" />

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 md:py-20">
        <h1 className="animate-fade-up font-display text-4xl leading-[1.05] font-semibold tracking-tight text-ink sm:text-5xl md:text-6xl lg:text-7xl">
          Let Her Speak
        </h1>
        <p className="animate-fade-up-delay mt-4 max-w-3xl font-display text-xl leading-snug font-medium text-accent-warm sm:mt-5 sm:text-2xl md:text-3xl">
          When One Woman Speaks, a Thousand Find Their Voice.
        </p>
        <p className="animate-fade-up-delay-2 mt-5 max-w-2xl text-[15px] leading-relaxed text-ink-soft sm:mt-6 sm:text-base md:text-lg">
          You are not alone in your story. Others have walked this road, felt this pain, fought this
          battle. And here, you will find them. This is a space for truth, for courage, for women who
          have held their stories in silence for too long.
        </p>

        <div className="animate-fade-up-delay-2 mt-6 grid max-w-3xl gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4">
          <div className="rounded-2xl border border-border bg-surface/90 p-4 shadow-sm">
            <p className="text-sm leading-relaxed text-ink-soft">
              <span className="mr-1.5" aria-hidden="true">
                💬
              </span>
              <strong className="font-semibold text-ink">Share your truth:</strong> Stories of
              resilience, injustice, gender bias, triumphs, or daily struggles. Anonymously, without
              judgment.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface/90 p-4 shadow-sm">
            <p className="text-sm leading-relaxed text-ink-soft">
              <span className="mr-1.5" aria-hidden="true">
                👂
              </span>
              <strong className="font-semibold text-ink">Find support:</strong> A community that
              listens, understands, and stands with you. Your words will be felt, your voice will
              inspire.
            </p>
          </div>
        </div>

        <div className="animate-fade-up-delay-2 mt-6 flex w-full flex-col gap-3 sm:mt-8 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
          <button
            type="button"
            onClick={onNewStory}
            className="w-full rounded-full bg-accent px-6 py-3 text-sm font-semibold text-surface transition hover:bg-accent-dark sm:w-auto"
          >
            Share your truth
          </button>
          <a
            href="#stories"
            className="w-full rounded-full border border-accent/35 bg-surface/70 px-6 py-3 text-center text-sm font-medium text-accent transition hover:border-accent hover:bg-accent-soft/40 sm:w-auto"
          >
            Find support
          </a>
        </div>
      </div>
    </section>
  );
}

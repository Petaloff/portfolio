"use client";

import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useSyncExternalStore } from "react";
import { Link } from "@/i18n/navigation";
import { consentStore, useConsent } from "@/lib/store";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";

const subscribeNoop = () => () => {};

// Vercel Analytics is cookie-free and always on. PostHog only loads after consent.
export function Analytics() {
  const consent = useConsent();
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);

  useEffect(() => {
    if (!POSTHOG_KEY) return;
    let cancelled = false;
    import("posthog-js").then(({ default: posthog }) => {
      if (cancelled) return;
      if (consent === "granted") {
        if (!posthog.__loaded) {
          posthog.init(POSTHOG_KEY, {
            api_host: POSTHOG_HOST,
            person_profiles: "identified_only",
            capture_pageview: "history_change",
          });
        }
        posthog.opt_in_capturing();
      } else if (posthog.__loaded) {
        posthog.opt_out_capturing();
      }
    });
    return () => {
      cancelled = true;
    };
  }, [consent]);

  return (
    <>
      <VercelAnalytics />
      {mounted && POSTHOG_KEY && <ConsentBanner open={consent === "unset"} />}
    </>
  );
}

function ConsentBanner({ open }: { open: boolean }) {
  const t = useTranslations("consent");
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-live="polite"
          aria-label={t("manage")}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl border border-line bg-bg/95 p-5 text-sm shadow-2xl backdrop-blur md:inset-x-auto md:right-6"
        >
          <p className="text-muted">
            {t("text")}{" "}
            <Link href="/privacy" className="text-fg underline underline-offset-4">
              {t("policy")}
            </Link>
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              className="border border-line px-4 py-2 transition-colors hover:border-fg"
              onClick={() => consentStore.set("denied")}
            >
              {t("decline")}
            </button>
            <button
              type="button"
              className="border border-fg bg-fg px-4 py-2 text-bg transition-opacity hover:opacity-85"
              onClick={() => consentStore.set("granted")}
            >
              {t("accept")}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Lets visitors change their decision later, e.g. from the privacy page
export function ConsentSettings() {
  const t = useTranslations("consent");
  const consent = useConsent();
  return (
    <div className="flex flex-wrap gap-2">
      {(["granted", "denied"] as const).map((value) => (
        <button
          key={value}
          type="button"
          aria-pressed={consent === value}
          onClick={() => consentStore.set(value)}
          className="border border-line px-4 py-2 text-sm aria-pressed:border-fg aria-pressed:bg-fg aria-pressed:text-bg"
        >
          {value === "granted" ? t("accept") : t("decline")}
        </button>
      ))}
    </div>
  );
}

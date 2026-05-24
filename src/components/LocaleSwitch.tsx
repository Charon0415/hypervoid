"use client";

import { useLocale } from "@/components/LocaleProvider";
import { LOCALES, LOCALE_LABEL } from "@/lib/i18n";

export function LocaleSwitch() {
  const { locale, setLocale, t } = useLocale();
  const nextLocale = LOCALES[(LOCALES.indexOf(locale) + 1) % LOCALES.length];

  return (
    <button
      type="button"
      onClick={() => setLocale(nextLocale)}
      aria-label={t.common.toggleLocale}
      title={`${t.common.toggleLocale} (${LOCALE_LABEL[nextLocale]})`}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card/70 text-xs font-semibold text-foreground backdrop-blur-sm transition hover:border-primary hover:bg-card hover:text-primary"
    >
      {LOCALE_LABEL[locale]}
    </button>
  );
}

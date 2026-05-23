"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  DEFAULT_LOCALE,
  LOCALES,
  MESSAGES,
  type Locale,
  type Messages,
} from "@/lib/i18n";

const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Messages;
}>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: MESSAGES[DEFAULT_LOCALE],
});

const COOKIE = "hypervoid:locale";
const STORAGE = "hypervoid:locale";

function readInitial(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const fromStorage = window.localStorage.getItem(STORAGE);
    if (fromStorage && (LOCALES as readonly string[]).includes(fromStorage)) {
      return fromStorage as Locale;
    }
  } catch {
    // ignore
  }
  const cookie = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${COOKIE}=`));
  if (cookie) {
    const value = decodeURIComponent(cookie.split("=")[1]);
    if ((LOCALES as readonly string[]).includes(value)) {
      return value as Locale;
    }
  }
  const browserLang = navigator.language;
  if (browserLang.startsWith("en")) return "en";
  return DEFAULT_LOCALE;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocaleState(readInitial());
    setMounted(true);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem(STORAGE, l);
    } catch {
      // ignore
    }
    document.cookie = `${COOKIE}=${encodeURIComponent(l)}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    document.documentElement.lang = l;
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = locale;
    }
  }, [locale, mounted]);

  return (
    <LocaleContext.Provider
      value={{ locale, setLocale, t: MESSAGES[locale] }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function useT(): Messages {
  return useContext(LocaleContext).t;
}

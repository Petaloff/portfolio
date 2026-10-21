import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import { getMessages } from "@/lib/cms";
import * as rootParams from "next/root-params";
import { routing, type Locale } from "./routing";

export default getRequestConfig(async ({ locale }) => {
  if (!locale) {
    const paramValue = await rootParams.locale();
    if (hasLocale(routing.locales, paramValue)) {
      locale = paramValue;
    } else {
      notFound();
    }
  }

  return {
    locale,
    // The JSON files with any texts edited in the admin panel on top
    messages: await getMessages(locale as Locale),
  };
});

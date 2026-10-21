"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth, signIn, signOut } from "@/auth";
import { routing, type Locale } from "@/i18n/routing";
import { mayPass, PASS_COOKIE } from "@/lib/admin/maintenance";
import { getMaintenance } from "@/lib/maintenance";

// The locale comes in a hidden field: bound arguments are encrypted with a
// random IV, which Cache Components refuses while prerendering
const localeOf = (form: FormData): Locale =>
  routing.locales.includes(form.get("locale") as Locale) ? (form.get("locale") as Locale) : routing.defaultLocale;

export async function enterSite(form: FormData) {
  const locale = localeOf(form);
  const session = await auth();
  if (session && mayPass(session.user.provider, session.user.id.split(":")[1], await getMaintenance({ fresh: true }))) {
    (await cookies()).set(PASS_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    redirect(`/${locale}`);
  }
  redirect(`/${locale}/maintenance`);
}

export async function maintenanceLogin(form: FormData) {
  await signIn("github", { redirectTo: `/${localeOf(form)}/maintenance` });
}

export async function maintenanceLogout(form: FormData) {
  await signOut({ redirectTo: `/${localeOf(form)}/maintenance` });
}

import { getToken } from "next-auth/jwt";
import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing, type Locale } from "./i18n/routing";
import { mayPass, PASS_COOKIE, type Maintenance } from "./lib/admin/maintenance";
import { getMaintenance } from "./lib/maintenance";

const intl = createMiddleware(routing);

// Reads the Auth.js session cookie straight from the request; no session, no pass
async function signedInMayPass(req: NextRequest, config: Maintenance) {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) return false;
  const secureCookie = req.cookies.getAll().some((c) => c.name.startsWith("__Secure-authjs.session-token"));
  const token = await getToken({ req, secret, secureCookie });
  return !!token && mayPass(String(token.provider ?? ""), String(token.uid ?? ""), config);
}

export default async function proxy(req: NextRequest) {
  const res = intl(req);
  // A locale redirect goes out first, the next request lands back here with the prefix
  if (res.headers.has("location")) return res;

  const [, first = "", section = ""] = req.nextUrl.pathname.split("/");
  const locale: Locale = routing.locales.includes(first as Locale) ? (first as Locale) : routing.defaultLocale;
  // The admin panel stays open during maintenance, it is where it gets switched off
  if (section === "admin") return res;

  const config = await getMaintenance();
  // Everyone else lands on the maintenance page, which has nothing to show while the site is up
  if (section === "maintenance") {
    return config.enabled ? res : NextResponse.redirect(new URL(`/${locale}`, req.url));
  }
  if (!config.enabled) return res;
  if (req.cookies.has(PASS_COOKIE) && (await signedInMayPass(req, config))) return res;

  const to = NextResponse.redirect(new URL(`/${locale}/maintenance`, req.url));
  to.headers.set("Cache-Control", "no-store");
  return to;
}

export const config = {
  // Skip Next internals, API routes and files with an extension
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};

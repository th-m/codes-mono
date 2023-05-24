
import { createCookieSessionStorage } from "solid-start";
import invariant from "tiny-invariant";
import { getProfileById, supabase } from "./users.server";
import { redirect } from "solid-start/server";
import { Session } from "@supabase/supabase-js";
invariant(
    process.env.SESSION_SECRET,
    "SESSION_SECRET must be set in your environment variables."
  );

  export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    secure: process.env.NODE_ENV === "production",
    secrets: [process.env.SESSION_SECRET],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true
  }
});


const USER_SESSION_KEY = "userId";
export const USER_SESSION_REFRESH_KEY = "userId_refresh";

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");

  return sessionStorage.getSession(cookie);
}

export async function getUserId(request: Request) {
  const session = await getSession(request);
  const access_token = session.get(USER_SESSION_KEY);
  const refresh_token = session.get(USER_SESSION_REFRESH_KEY);
  const supaSession = await supabase.auth.setSession({access_token, refresh_token});
  const userId = supaSession.data.user?.id
  return userId;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (userId === undefined) return null;
  const user = await getProfileById(userId);
  if (user) return user;
  throw await logout(request);
}

/**
 * Require a user session to get to a page. If none is found
 * redirect them to the login page. After login, take them to
 * the original page they wanted to get to.
 */
export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const userId = await getUserId(request);
  if (!userId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }

  return userId;
}

export async function requireUser(request: Request) {
  const userId = await requireUserId(request);
  if (userId == undefined) return null;

  const profile = await getProfileById(userId);
  if (profile) return profile;

  throw await logout(request);
}

export async function createUserSession({
  request,
  session,
  remember,
  redirectTo,
}: {
  request: Request;
  session: Session;
  remember: boolean;
  redirectTo: string;
}) {
  // const session = await getSession(request);
  const cookieSession = await getSession(request);
  cookieSession.set(USER_SESSION_KEY, session.access_token);
  cookieSession.set(USER_SESSION_REFRESH_KEY, session.refresh_token);
  // const { supabaseClient } = await getClientAndUser(request);
  // supabaseClient.auth.setSession(session);
  
  // session.set(USER_SESSION_KEY, userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(cookieSession, {
        maxAge: remember
          ? 60 * 60 * 24 * 7 // 7 days
          : undefined,
      }),
    },
  });
}

export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
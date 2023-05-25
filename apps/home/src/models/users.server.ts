import { createClient } from "@supabase/supabase-js";
import invariant from "tiny-invariant";

export type User = { id: string; email: string };

// Abstract this away
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecret = process.env.SUPABASE_SECRET;

invariant(
  supabaseUrl,
  "SUPABASE_URL must be set in your environment variables."
);
invariant(
  supabaseSecret,
  "SUPABASE_SECRET must be set in your environment variables."
);

export const supabase = createClient(supabaseUrl, supabaseSecret);

export async function createUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  const session = data?.session;

  return {session, error};
}

export async function getProfileById(id: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("email, id")
    .eq("id", id)
    .single();

  if (error) {
    console.log(error)
    return null};
  if (data) return { id: data.id, email: data.email };
}

export async function getProfileByEmail(email?: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("email, id")
    .eq("email", email)
    .single();

  if (error) return null;
  if (data) return data;
}

export async function verifyLogin(email: string, password: string) {
  const resp = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  const error = resp.error;
  // const user = resp.data?.user;
  if (error) return undefined;
  return resp.data.session;
  // const profile = await getProfileByEmail(user?.email);

  // return profile;
}

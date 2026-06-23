import { supabase } from "./supabase";

export async function upsertUserProfileFromSession(session: any) {
  if (!session?.user) return null;
  const user = session.user;
  const userProfile = {
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name || null,
    avatar_url: user.user_metadata?.avatar_url || null,
    provider: user.app_metadata?.provider || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("profiles")
    .upsert(userProfile, { returning: "minimal" });

  if (error) {
    console.error("Error upserting profile:", error);
    throw error;
  }

  return data;
}

export async function fetchProjectsForUser(userId: string) {
  const { data, error } = await supabase
    .from("projects")
    .select("id,name,description,created_at")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user projects:", error);
    throw error;
  }

  return data || [];
}

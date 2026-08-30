import { supabase } from "../supabaseClient";

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function onAuthStateChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return data.subscription;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

// Fetches the profile row (role, linked teacher/student) for a logged-in user.
export async function getProfile(userId) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error) throw error;
  return {
    id: data.id,
    name: data.name,
    role: data.role,
    teacherId: data.teacher_id,
    studentId: data.student_id,
    mustChangePassword: !!data.must_change_password,
  };
}

export async function updatePassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;

  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData?.session?.user?.id;
  if (userId) {
    const { error: profileError } = await supabase.from("profiles").update({ must_change_password: false }).eq("id", userId);
    if (profileError) throw profileError;
  }

  return data;
}

// Calls the admin-create-user Edge Function to create a real login for a
// teacher or student. Requires the caller to already be signed in as admin
// (the function verifies this server-side too).
export async function createLogin({ email, password, name, role, teacherId, studentId }) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) throw new Error("Not signed in.");

  const { data, error } = await supabase.functions.invoke("admin-create-user", {
    body: { email, password, name, role, teacherId, studentId, mustChangePassword: true },
    headers: { Authorization: `Bearer ${token}` },
  });
  if (error) throw error;
  return data;
}

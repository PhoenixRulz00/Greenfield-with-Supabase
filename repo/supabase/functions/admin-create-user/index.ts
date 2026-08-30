// supabase/functions/admin-create-user/index.ts
//
// Deployed as a Supabase Edge Function. Lets the admin panel create a real
// login (Supabase Auth user) for a teacher or student it just created.
//
// Deploy with:
//   supabase functions deploy admin-create-user
//
// The SERVICE ROLE KEY is read from the function's own environment (set via
// `supabase secrets set`), never sent to or stored in the browser.
//
// Request body: { email, password, name, role, teacherId?, studentId? }
// Caller must send their own Supabase Auth access token in the
// Authorization header; this function verifies that caller is an admin
// before doing anything.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const callerToken = authHeader.replace("Bearer ", "");
    if (!callerToken) {
      return json({ error: "Missing Authorization header." }, 401);
    }

    // Verify the caller's identity + role using a client scoped to their token.
    const callerClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${callerToken}` } },
    });
    const { data: userData, error: userErr } = await callerClient.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "Invalid session." }, 401);

    const { data: profile, error: profileErr } = await callerClient
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .single();
    if (profileErr || profile?.role !== "admin") {
      return json({ error: "Only admins can create new logins." }, 403);
    }

    const { email, password, name, role, teacherId, studentId, mustChangePassword } = await req.json();
    if (!email || !password || !name || !role) {
      return json({ error: "email, password, name and role are required." }, 400);
    }
    if (!["admin", "teacher", "student"].includes(role)) {
      return json({ error: "role must be admin, teacher or student." }, 400);
    }

    // Now act with the service role to actually create the Auth user.
    // The on_auth_user_created trigger (see schema.sql) will insert the
    // matching public.profiles row automatically from this metadata.
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role,
        teacher_id: teacherId || "",
        student_id: studentId || "",
        must_change_password: String(Boolean(mustChangePassword)),
      },
    });
    if (createErr) return json({ error: createErr.message }, 400);

    return json({ user: created.user }, 201);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unexpected error";
    return json({ error: errorMessage }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

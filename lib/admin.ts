/**
 * Server-side admin gate. Uses the user session + profiles.role.
 */
import { createClient, createServiceClient } from "@/lib/supabase/server";

export type AdminUser = { id: string; email: string | null; role: string };

export async function requireAdmin(): Promise<
  { ok: true; user: AdminUser } | { ok: false; status: number; error: string }
> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return { ok: false, status: 401, error: "Unauthorized" };
    }

    // Prefer service role so RLS does not block role lookup edge cases
    let role = "customer";
    try {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const service = createServiceClient();
        const { data } = await service
          .from("profiles")
          .select("role, email")
          .eq("id", user.id)
          .maybeSingle();
        role = (data?.role as string) ?? "customer";
      } else {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        role = (data?.role as string) ?? "customer";
      }
    } catch {
      return { ok: false, status: 503, error: "Could not verify admin role" };
    }

    if (role !== "admin") {
      return { ok: false, status: 403, error: "Forbidden" };
    }

    return {
      ok: true,
      user: { id: user.id, email: user.email ?? null, role },
    };
  } catch {
    return { ok: false, status: 401, error: "Unauthorized" };
  }
}

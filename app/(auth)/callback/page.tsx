"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Spinner } from "flowbite-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        router.push(next);
      }
    });
  }, [next, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-950">
      <Spinner size="xl" aria-label="Completing sign in" />
      <p className="text-gray-500 dark:text-gray-400">Completing sign in…</p>
    </div>
  );
}

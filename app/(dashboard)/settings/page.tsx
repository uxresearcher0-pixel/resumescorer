import type { Metadata } from "next";
import { Card, Button, Label, TextInput } from "flowbite-react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, plan, scans_used, scans_limit")
    .eq("id", user?.id!)
    .single();

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">Manage your account preferences.</p>
      </div>

      <div className="space-y-6">
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Profile</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" value="Full name" className="mb-1.5 block" />
              <TextInput id="name" defaultValue={profile?.full_name || ""} placeholder="Your name" />
            </div>
            <div>
              <Label htmlFor="email" value="Email address" className="mb-1.5 block" />
              <TextInput id="email" defaultValue={profile?.email || ""} type="email" disabled className="opacity-60" />
              <p className="mt-1 text-xs text-gray-400">Email cannot be changed.</p>
            </div>
            <Button color="blue" size="sm" className="font-medium">Save changes</Button>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Plan & Usage</h2>
          <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
            <div>
              <p className="font-semibold capitalize text-gray-900 dark:text-white">{profile?.plan} Plan</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {profile?.scans_used}/{profile?.scans_limit} scans used this month
              </p>
            </div>
            {profile?.plan === "free" && (
              <Button color="blue" href="/pricing" size="sm" className="font-medium">
                Upgrade to Pro
              </Button>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Danger Zone</h2>
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/10">
            <p className="mb-3 text-sm font-medium text-red-800 dark:text-red-300">Delete account</p>
            <p className="mb-4 text-xs text-red-600 dark:text-red-400">
              This will permanently delete your account, all resumes, and analysis history.
            </p>
            <Button color="failure" size="sm">Delete my account</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export interface UserProfile {
  id: string;
  full_name?: string;
  email: string;
  role: "user" | "admin" | "consultant";
  plan: "free" | "pro" | "enterprise";
  scans_used: number;
  scans_limit: number;
  created_at: string;
}

export interface UserStats {
  totalScans: number;
  averageScore: number;
  bestScore: number;
  latestScore: number | null;
  scansRemaining: number;
}

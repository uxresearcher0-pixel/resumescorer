import { Button, Badge } from "flowbite-react";
import {
  FileText,
  CheckCircle,
  Zap,
  BarChart3,
  Target,
  ArrowRight,
  Star,
} from "lucide-react";

const features = [
  {
    icon: <CheckCircle className="h-5 w-5" />,
    title: "ATS Compatibility Check",
    desc: "Find out if ATS systems can read your resume before you apply.",
  },
  {
    icon: <Target className="h-5 w-5" />,
    title: "Keyword Gap Analysis",
    desc: "See exactly which job description keywords are missing from your resume.",
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: "AI Rewrite Suggestions",
    desc: "Get AI-powered rewrites for weak bullet points with measurable impact.",
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: "Detailed Score Breakdown",
    desc: "6-category scoring across ATS, keywords, skills, experience, impact, and formatting.",
  },
];

const steps = [
  { step: "01", title: "Upload Your Resume", desc: "PDF, DOCX, or TXT — we extract and analyze it instantly." },
  { step: "02", title: "Paste Job Description", desc: "Copy any job posting and paste it in. We extract the key requirements." },
  { step: "03", title: "Get Your Score", desc: "Receive a detailed report with scores, missing keywords, and improvement suggestions." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-950/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              ResumeFit <span className="text-blue-600">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button color="light" href="/login" size="sm">Sign in</Button>
            <Button color="blue" href="/signup" size="sm">Get started free</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-24 pt-20">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-950 dark:to-blue-950/20" />
        <div className="mx-auto max-w-4xl text-center">
          <Badge color="blue" className="mb-6 inline-flex">
            <Zap className="mr-1 h-3 w-3" /> AI-Powered Resume Analysis
          </Badge>
          <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white md:text-6xl">
            Will your resume pass
            <br />
            <span className="text-blue-600">the ATS filter?</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-gray-600 dark:text-gray-400">
            Upload your resume, paste a job description, and get an instant AI-powered score with
            keyword gaps, ATS issues, and actionable improvements.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button color="blue" size="xl" href="/signup" className="px-8 font-semibold">
              Analyze My Resume Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button color="light" size="xl" href="/login" className="font-semibold">
              Sign In
            </Button>
          </div>
          <p className="mt-4 text-sm text-gray-400 dark:text-gray-500">
            No credit card required · 3 free scans/month
          </p>
        </div>

        {/* Sample score preview card */}
        <div className="mx-auto mt-16 max-w-2xl">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
            <div className="border-b border-gray-100 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  Resume Analysis — UX Designer @ Figma
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Overall Score</p>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white">76<span className="text-xl text-gray-400">/100</span></p>
                  <Badge color="blue" className="mt-1">Good</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-right text-sm">
                  {[
                    { label: "ATS", score: 82 },
                    { label: "Keywords", score: 74 },
                    { label: "Skills", score: 68 },
                    { label: "Experience", score: 79 },
                  ].map(({ label, score }) => (
                    <div key={label} className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className="font-bold text-gray-900 dark:text-white">{score}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">✗ UX research</span>
                <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">✗ User testing</span>
                <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">✓ Figma</span>
                <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">✓ Design systems</span>
                <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">✓ Accessibility</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white">
            How it works
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white">
                  {step}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 px-6 py-24 dark:bg-gray-900">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white">
            Everything you need to land more interviews
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {features.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                  {icon}
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">{title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 text-center">
        <div className="mx-auto max-w-xl">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
            Ready to score your resume?
          </h2>
          <p className="mb-8 text-gray-500 dark:text-gray-400">
            Join thousands of job seekers who improved their application quality with ResumeFit AI.
          </p>
          <Button color="blue" size="xl" href="/signup" className="px-10 font-semibold">
            Get started free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8 dark:border-gray-800">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400 md:flex-row">
          <div className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-300">
            <FileText className="h-4 w-4" />
            ResumeFit AI
          </div>
          <p>© {new Date().getFullYear()} ResumeFit AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

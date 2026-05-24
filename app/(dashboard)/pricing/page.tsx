import type { Metadata } from "next";
import { Card, Button, Badge } from "flowbite-react";
import { CheckCircle } from "lucide-react";

export const metadata: Metadata = { title: "Pricing" };

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    badge: null,
    features: [
      "3 resume analyses/month",
      "ATS compatibility score",
      "Keyword gap analysis",
      "Basic improvement suggestions",
      "PDF report download",
    ],
    cta: "Current plan",
    ctaColor: "light" as const,
    disabled: true,
  },
  {
    name: "Pro",
    price: "$9",
    period: "per month",
    badge: "Most Popular",
    features: [
      "Unlimited resume analyses",
      "AI bullet point rewriter",
      "Side-by-side improvement editor",
      "Detailed section suggestions",
      "Priority AI processing",
      "Analysis history (unlimited)",
      "Email report delivery",
    ],
    cta: "Upgrade to Pro",
    ctaColor: "blue" as const,
    disabled: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    badge: null,
    features: [
      "Everything in Pro",
      "Bulk resume screening",
      "Career consultant tools",
      "Team workspaces",
      "API access",
      "SSO / SAML",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    ctaColor: "light" as const,
    disabled: false,
  },
];

export default function PricingPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Simple, transparent pricing</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Start free, upgrade when you need more.</p>
      </div>

      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative flex flex-col ${plan.badge ? "border-blue-300 ring-2 ring-blue-500/20 dark:border-blue-600" : ""}`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge color="blue" className="px-3 py-1 text-xs font-semibold">{plan.badge}</Badge>
              </div>
            )}

            <div className="mb-6">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{plan.name}</p>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{plan.period}</span>
              </div>
            </div>

            <ul className="mb-8 flex-1 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              color={plan.ctaColor}
              className="w-full font-semibold"
              disabled={plan.disabled}
            >
              {plan.cta}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

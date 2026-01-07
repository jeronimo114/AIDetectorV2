"use client";

import Link from "next/link";

import LoadingLink from "@/components/LoadingLink";
import AnimatedCounter from "@/components/AnimatedCounter";
import AnimatedStat from "@/components/AnimatedStat";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "For occasional checks.",
    cta: "Start free",
    ctaHref: "/signup",
    popular: false,
    highlights: [
      "5 analyses per day",
      "Up to 1,500 characters",
      "Basic verdict + confidence",
      "Last 5 runs saved"
    ]
  },
  {
    name: "Starter",
    price: "$4",
    period: "/month",
    description: "Submit assignments with confidence and peace of mind.",
    cta: "Get Starter",
    ctaHref: "/signup",
    popular: true,
    highlights: [
      "100 analyses per month",
      "Up to 6,000 characters",
      "Edit and recheck workflow",
      "What changed panel",
      "Signal breakdown",
      "Full history"
    ]
  },
  {
    name: "Pro",
    price: "$12",
    period: "/month",
    description: "For higher volume and exports.",
    cta: "Get Pro",
    ctaHref: "/signup",
    popular: false,
    highlights: [
      "500 analyses per month",
      "Up to 12,000 characters",
      "Unlimited edit chains",
      "Comparison history",
      "Exports (PDF / CSV)",
      "Priority processing"
    ]
  }
];

const featureRows = [
  { feature: "Basic verdict", free: true, starter: true, pro: true },
  { feature: "Confidence score", free: true, starter: true, pro: true },
  { feature: "Signal explanations", free: false, starter: true, pro: true },
  { feature: "Edit and recheck", free: false, starter: true, pro: true },
  { feature: "What changed feedback", free: false, starter: true, pro: true },
  { feature: "Full run history", free: false, starter: true, pro: true },
  { feature: "Comparison chains", free: false, starter: false, pro: true },
  { feature: "Exports", free: false, starter: false, pro: true },
  { feature: "Priority processing", free: false, starter: false, pro: true }
];

const testimonials = [
  {
    quote: "Veridict helped me understand why my essay was flagged. I fixed it in 10 minutes.",
    name: "Sarah M.",
    role: "Undergraduate, UCLA"
  },
  {
    quote: "The signal breakdown is incredibly useful. I can see exactly what to improve.",
    name: "James K.",
    role: "Graduate Student, NYU"
  },
  {
    quote: "Finally, a tool that explains instead of just accusing. Worth every penny.",
    name: "Elena P.",
    role: "Masters Student, EU"
  }
];

const stats = [
  { value: "50K+", label: "Students Helped" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "500K+", label: "Analyses Run" },
  { value: "24/7", label: "Availability" }
];

export default function PricingPage() {
  return (
    <main className="relative min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50 to-white py-20">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              <span className="text-sm font-medium text-orange-700">Simple, transparent pricing</span>
            </div>
            <h1 className="mt-6 text-4xl font-bold text-gray-900 sm:text-5xl">
              Choose the plan that fits
              <span className="block text-orange-500">your workflow</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Start free, upgrade when you need more. All plans include our core AI detection technology.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="mt-16 grid gap-8 lg:grid-cols-3 lg:items-start">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl border bg-white p-8 shadow-sm transition-all hover:shadow-md ${
                  tier.popular
                    ? "scale-105 border-orange-300 shadow-lg ring-2 ring-orange-500 lg:scale-110 lg:-translate-y-4"
                    : "border-gray-200"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-4 py-1.5 text-sm font-semibold text-white shadow-md">
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                        <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                      </svg>
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900">{tier.name}</h3>
                  <div className="mt-4 flex items-baseline justify-center gap-1">
                    <span className={`text-5xl font-bold ${tier.popular ? "text-orange-600" : "text-gray-900"}`}>
                      {tier.price}
                    </span>
                    <span className="text-gray-500">{tier.period}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{tier.description}</p>
                </div>

                <LoadingLink
                  href={tier.ctaHref}
                  className={`mt-8 block w-full rounded-full py-3.5 text-center text-sm font-semibold transition-all ${
                    tier.popular
                      ? "bg-orange-500 text-white shadow-md hover:bg-orange-600 hover:shadow-lg"
                      : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {tier.cta}
                </LoadingLink>

                <ul className="mt-8 space-y-4">
                  {tier.highlights.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                          tier.popular ? "text-orange-500" : "text-green-500"
                        }`}
                      >
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="border-y border-gray-100 bg-gray-50 py-16">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-bold text-gray-900">
                  <AnimatedStat value={stat.value} duration={2000} />
                </p>
                <p className="mt-1 text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-20">
        <div className="mx-auto max-w-[1000px] px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Compare all features</h2>
            <p className="mt-3 text-gray-600">See exactly what you get with each plan</p>
          </div>

          <div className="mt-12 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Free</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-orange-600 bg-orange-50">Starter</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {featureRows.map((row) => (
                  <tr key={row.feature} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">{row.feature}</td>
                    <td className="px-6 py-4 text-center">
                      {row.free ? (
                        <svg viewBox="0 0 20 20" fill="currentColor" className="mx-auto h-5 w-5 text-green-500">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center bg-orange-50/50">
                      {row.starter ? (
                        <svg viewBox="0 0 20 20" fill="currentColor" className="mx-auto h-5 w-5 text-orange-500">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row.pro ? (
                        <svg viewBox="0 0 20 20" fill="currentColor" className="mx-auto h-5 w-5 text-green-500">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 text-center">
            <LoadingLink
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-8 py-4 text-sm font-semibold text-white shadow-md transition-all hover:bg-orange-600 hover:shadow-lg"
            >
              Start with Starter — Most Popular
              <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </LoadingLink>
          </div>
        </div>
      </section>

      {/* About Section - Matching Reference Image */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left: Image Placeholder with Floating Card */}
            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-gray-200">
                <div className="flex h-full w-full items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" className="h-16 w-16 text-gray-400">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M3 16l5-5 4 4 5-5 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                  </svg>
                </div>
              </div>
              {/* Floating Trust Card */}
              <div className="absolute -bottom-6 -right-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-lg sm:right-4">
                <p className="text-xs font-medium text-gray-500">Trusted by <AnimatedCounter value={2} suffix="k+" duration={1500} /> Customers</p>
                <p className="mt-1 text-sm text-gray-900">
                  Join <span className="font-semibold text-orange-600"><AnimatedCounter value={2} suffix="k+" duration={1500} /></span> students who use Veridict to review their writing.
                </p>
                <div className="mt-3 flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-yellow-400">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-2 text-xs text-gray-500"><AnimatedCounter value={2} suffix="k+" duration={1500} /> Reviews</span>
                </div>
              </div>
            </div>

            {/* Right: Content */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                <span className="text-sm font-medium text-orange-700">About Us</span>
              </div>
              <h2 className="mt-6 text-3xl font-bold text-gray-900">
                Expert Solutions for Your
                <span className="block text-orange-500">Academic Future</span>
              </h2>
              <p className="mt-4 text-gray-600">
                Our comprehensive solutions provide expert guidance in AI detection, revision tracking, and more.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4">
                {[
                  "50+ Countries Worldwide",
                  "98% Customer Satisfaction",
                  "Over 500k+ Analyses",
                  "24/7 Customer Support"
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-orange-500">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>

              <LoadingLink
                href="/signup"
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm transition-all hover:bg-gray-50"
              >
                Try for Free
              </LoadingLink>
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="mt-20 border-t border-gray-200 pt-12">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-4xl font-bold text-gray-900">
                  <AnimatedCounter value={24} suffix="K+" duration={2000} />
                </p>
                <p className="mt-1 text-sm text-gray-600">Business</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-gray-900">
                  <AnimatedCounter value={16} prefix="$" suffix="M+" duration={2000} />
                </p>
                <p className="mt-1 text-sm text-gray-600">Transaction</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-gray-900">
                  <AnimatedCounter value={160} suffix="M+" duration={2000} />
                </p>
                <p className="mt-1 text-sm text-gray-600">Transactions yearly</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Loved by students everywhere</h2>
            <p className="mt-3 text-gray-600">See what our users have to say about Veridict</p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-yellow-400">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="mt-4 text-gray-700">"{testimonial.quote}"</p>
                <div className="mt-4">
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t border-gray-100 bg-gray-50 py-20">
        <div className="mx-auto max-w-[800px] px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Frequently asked questions</h2>
            <p className="mt-3 text-gray-600">Everything you need to know about our pricing</p>
          </div>

          <div className="mt-12 space-y-4">
            {[
              {
                q: "Can I switch plans later?",
                a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and you'll be billed proportionally."
              },
              {
                q: "What happens when I run out of analyses?",
                a: "You'll be notified when you're running low. You can upgrade your plan or wait until the next billing cycle for your analyses to reset."
              },
              {
                q: "Is there a free trial for paid plans?",
                a: "The Free plan gives you 5 analyses per day to try our service. If you need more, you can upgrade at any time."
              },
              {
                q: "Can I cancel anytime?",
                a: "Absolutely. You can cancel your subscription at any time with no questions asked. Your access continues until the end of your billing period."
              }
            ].map((faq, index) => (
              <details
                key={index}
                className="group rounded-2xl border border-gray-200 bg-white"
              >
                <summary className="flex cursor-pointer items-center justify-between p-6 [&::-webkit-details-marker]:hidden">
                  <span className="font-semibold text-gray-900">{faq.q}</span>
                  <span className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 transition-colors group-open:border-orange-200 group-open:bg-orange-50">
                    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 text-gray-500 transition-transform group-open:rotate-180 group-open:text-orange-500">
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 py-20">
        <div className="mx-auto max-w-[800px] px-6 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to check your writing?
          </h2>
          <p className="mt-4 text-lg text-gray-300">
            Join thousands of students who trust Veridict to help them submit with confidence.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <LoadingLink
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-8 py-4 text-sm font-semibold text-white shadow-lg transition-all hover:bg-orange-600"
            >
              Get Started Free
              <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </LoadingLink>
            <LoadingLink
              href="/detector"
              className="inline-flex items-center rounded-full border border-gray-600 px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-gray-800"
            >
              Try the Detector
            </LoadingLink>
          </div>
          <p className="mt-6 text-sm text-gray-400">
            No credit card required · Cancel anytime
          </p>
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="border-t border-gray-100 bg-white py-12">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:flex-row sm:p-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Need enterprise or institutional access?</h3>
              <p className="mt-1 text-gray-600">Contact us for custom pricing, bulk analysis, and dedicated support.</p>
            </div>
            <Link
              href="mailto:veridictaidetector@gmail.com"
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition-all hover:bg-gray-50"
            >
              Contact Sales
              <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

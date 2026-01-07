"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";

import LoadingLink from "@/components/LoadingLink";
import JsonLd, { faqSchema } from "@/components/JsonLd";

const FILE_ACCEPT =
  ".txt,.md,.doc,.docx,.pdf,text/plain,text/markdown,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const MIN_CHARS = 80;

const STATS = [
  { value: "50K+", label: "Analyses" },
  { value: "98%", label: "Accuracy" },
  { value: "12+", label: "Universities" },
  { value: "<2s", label: "Response" }
];

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    title: "Confidence Scoring",
    description: "Get probability scores with context, not just binary verdicts."
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Signal Detection",
    description: "See exactly which patterns triggered the detection."
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path d="M12 20V10M18 20V4M6 20v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Draft Comparison",
    description: "Track how your edits affect the score over time."
  }
];

const TESTIMONIALS = [
  {
    quote: "Finally, a detector that explains why something looks AI-generated. The signals breakdown made revising my thesis so much clearer.",
    name: "Maya R.",
    role: "PhD Candidate",
    institution: "Oxford University",
    rating: 5
  },
  {
    quote: "The comparison feature is brilliant. I can see exactly which edits improve my score before submitting.",
    name: "Jordan K.",
    role: "Graduate Student",
    institution: "MIT",
    rating: 5
  },
  {
    quote: "No more anxiety before submitting papers. Veridict gives me confidence that my writing is authentic.",
    name: "Elena P.",
    role: "Masters Student",
    institution: "ETH Zurich",
    rating: 5
  }
];

const TRUST_LOGOS = [
  { name: "Stanford", abbr: "SU" },
  { name: "MIT", abbr: "MIT" },
  { name: "Oxford", abbr: "OX" },
  { name: "Harvard", abbr: "HU" },
  { name: "Cambridge", abbr: "CAM" }
];

const FAQS = [
  {
    question: "How accurate is AI detection?",
    answer: "AI detection tools analyze patterns in writing style, not the actual source. Veridict shows you which signals are being detected and their confidence levels, so you can understand what's being flagged and make informed revisions."
  },
  {
    question: "Will my essay be flagged if I used Grammarly?",
    answer: "Grammar tools and spell-checkers generally don't trigger AI detection because they correct errors rather than generate new content. Veridict helps you identify these patterns before submission."
  },
  {
    question: "How do I reduce AI detection signals?",
    answer: "Focus on varying sentence length, adding personal examples and concrete details, using natural transitions, and avoiding repetitive structures."
  },
  {
    question: "Is my text stored or shared?",
    answer: "Your text is processed securely and stored only in your account history so you can track revisions. We never share your content with third parties."
  }
];

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.replace(/[^a-zA-Z]/g, "")[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function HomePage() {
  const [text, setText] = useState("");
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const charCount = text.length;
  const canPreview = charCount >= MIN_CHARS;

  useEffect(() => {
    return () => {
      if (previewTimerRef.current) {
        clearTimeout(previewTimerRef.current);
      }
    };
  }, []);

  const handlePreview = () => {
    if (!canPreview) return;
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
    }
    setShowGate(false);
    setIsPreviewing(true);
    previewTimerRef.current = setTimeout(() => {
      setIsPreviewing(false);
      setShowGate(true);
    }, 1800);
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Loading overlay */}
      {isPreviewing && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/95 backdrop-blur-sm">
          <div className="w-full max-w-md px-6 text-center" role="status" aria-live="polite">
            <div className="mx-auto mb-6 h-12 w-12 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin" />
            <p className="text-lg font-semibold text-gray-900">Analyzing your text...</p>
            <p className="mt-2 text-sm text-gray-500">This will only take a moment</p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-white to-white" />

        <div className="relative mx-auto max-w-[1200px] px-6 pb-20 pt-16">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Left column - Content */}
            <div className="opacity-0 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              {/* Badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-sm font-medium text-orange-700">Try for Free</span>
              </div>

              {/* Main heading */}
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-[3.5rem]">
                Your Writing Clarity,{" "}
                <span className="text-orange-500">Just A Click Away</span>
              </h1>

              {/* Subheading */}
              <p className="mt-6 text-lg leading-relaxed text-gray-600">
                Check your essay before you submit. Get clear signals about AI detection patterns and understand exactly what needs revision.
              </p>

              {/* CTA buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <LoadingLink
                  href="/signup?redirectedFrom=/detector"
                  className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-600 hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5"
                >
                  Try for Free
                </LoadingLink>
                <LoadingLink
                  href="/detector"
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300"
                >
                  Learn More
                  <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                    <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </LoadingLink>
              </div>

              {/* Social proof */}
              <div className="mt-10 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {["M", "J", "E", "A"].map((initial, i) => (
                    <div
                      key={i}
                      className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-gray-100 to-gray-200 text-xs font-semibold text-gray-600 shadow-sm"
                    >
                      {initial}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-yellow-400">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">Trusted by 2k+ Customers</p>
                </div>
              </div>
            </div>

            {/* Right column - Dashboard mockup */}
            <div className="relative opacity-0 animate-fade-up" style={{ animationDelay: "0.3s" }}>
              {/* Main card - Dashboard preview */}
              <div className="relative rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl shadow-gray-200/50">
                {/* Dashboard header */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 p-2">
                      <svg viewBox="0 0 24 24" fill="none" className="h-full w-full text-orange-500">
                        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Analysis Result</p>
                      <p className="text-xs text-gray-500">Your latest check</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                    Complete
                  </span>
                </div>

                {/* Score display */}
                <div className="mt-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Confidence Score</p>
                      <p className="mt-1 text-4xl font-bold text-gray-900">87%</p>
                    </div>
                    <span className="rounded-lg bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700">
                      Likely Human
                    </span>
                  </div>
                  <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full w-[87%] rounded-full bg-gradient-to-r from-green-400 to-green-500" />
                  </div>
                </div>

                {/* Quick stats */}
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="rounded-xl bg-gray-50 p-3 text-center">
                    <p className="text-2xl font-bold text-gray-900">3</p>
                    <p className="text-xs text-gray-500">Signals</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3 text-center">
                    <p className="text-2xl font-bold text-gray-900">1.2s</p>
                    <p className="text-xs text-gray-500">Analysis</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3 text-center">
                    <p className="text-2xl font-bold text-gray-900">A+</p>
                    <p className="text-xs text-gray-500">Grade</p>
                  </div>
                </div>
              </div>

              {/* Floating card - M+ Customers */}
              <div className="absolute -right-4 -top-4 rounded-xl border border-gray-100 bg-white p-4 shadow-lg animate-float">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="h-8 w-8 rounded-full border-2 border-white bg-orange-100" />
                    <div className="h-8 w-8 rounded-full border-2 border-white bg-blue-100" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">2M+ Customers</p>
                    <p className="text-xs text-gray-500">trust us daily!</p>
                  </div>
                </div>
              </div>

              {/* Floating card - Account type */}
              <div className="absolute -bottom-4 -left-4 rounded-xl border border-gray-100 bg-white p-4 shadow-lg animate-float" style={{ animationDelay: "1s" }}>
                <p className="text-xs text-gray-500">Account Type</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">Student</span>
                  <span className="rounded bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">Pro</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="border-y border-gray-100 bg-gray-50/50 py-12">
        <div className="mx-auto max-w-[1200px] px-6">
          <p className="text-center text-sm text-gray-500">
            Trusted by students at over 100 universities worldwide
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {TRUST_LOGOS.map((logo) => (
              <div
                key={logo.name}
                className="flex items-center gap-2 text-gray-400 transition-colors hover:text-gray-600"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-200/50 text-xs font-bold">
                  {logo.abbr}
                </div>
                <span className="text-sm font-medium">{logo.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                <span className="text-xs font-medium text-orange-700">Payment Feature</span>
              </div>
              <h2 className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl">
                An experience that <span className="text-orange-500">evolves</span><br />
                and scales with you.
              </h2>
            </div>
            <p className="max-w-md text-gray-600">
              Our platform adapts to your needs, providing a seamless experience that grows and scales as you do.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-gray-100 bg-white p-6 transition-all hover:border-orange-100 hover:shadow-lg hover:shadow-orange-50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-500 transition-colors group-hover:bg-orange-100">
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{feature.description}</p>
                <button className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-orange-500">
                  Learn More
                  <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                    <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About/Stats Section */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Image placeholder */}
            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300">
                <div className="flex h-full items-center justify-center text-gray-400">
                  <svg viewBox="0 0 24 24" fill="none" className="h-16 w-16">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                    <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              {/* Floating trust badge */}
              <div className="absolute -bottom-6 left-6 rounded-xl border border-gray-100 bg-white p-4 shadow-lg">
                <p className="text-xs font-medium text-gray-500">Trusted by 2M+ Customers</p>
                <p className="mt-1 text-sm text-gray-600">
                  Join over <span className="font-semibold text-orange-500">+16,500</span> new customers who choose our product every day!
                </p>
                <div className="mt-2 flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3 text-yellow-400">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-1 text-xs text-gray-500">34k+ Reviews</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                <span className="text-xs font-medium text-orange-700">About Us</span>
              </div>
              <h2 className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl">
                Expert Solutions for Your <span className="text-orange-500">Academic Future</span>
              </h2>
              <p className="mt-4 text-gray-600">
                Our comprehensive solutions provide expert guidance in AI detection, revision tracking, and more.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-orange-500">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-600">50+ Countries Worldwide</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-orange-500">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-600">98% Customer Satisfaction</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-orange-500">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-600">Over 500k+ Analyses</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-orange-500">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-600">24/7 Customer Support</span>
                </div>
              </div>

              <LoadingLink
                href="/signup"
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300"
              >
                Try for Free
              </LoadingLink>

              {/* Stats */}
              <div className="mt-10 flex gap-8 border-t border-gray-200 pt-8">
                <div>
                  <p className="text-3xl font-bold text-gray-900">24K+</p>
                  <p className="text-sm text-gray-500">Business</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">$16M+</p>
                  <p className="text-sm text-gray-500">Transaction</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">160M+</p>
                  <p className="text-sm text-gray-500">Transactions yearly</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
              <span className="text-xs font-medium text-orange-700">Student Feedback</span>
            </div>
            <h2 className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              Trusted by students <span className="text-orange-500">worldwide</span>
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((item) => (
              <div
                key={item.name}
                className="rounded-2xl border border-gray-100 bg-white p-6 transition-all hover:shadow-lg"
              >
                <div className="flex gap-1">
                  {[...Array(item.rating)].map((_, i) => (
                    <svg key={i} viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-yellow-400">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="mt-4 text-gray-600 leading-relaxed">"{item.quote}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-50 text-sm font-semibold text-orange-600">
                    {getInitials(item.name)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.role} · {item.institution}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-50 py-20">
        <JsonLd data={faqSchema(FAQS)} />
        <div className="mx-auto max-w-[800px] px-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
              <span className="text-xs font-medium text-orange-700">Questions</span>
            </div>
            <h2 className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              Frequently asked
            </h2>
          </div>

          <div className="mt-12 space-y-4">
            {FAQS.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-gray-200 bg-white overflow-hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 p-6 text-gray-900 [&::-webkit-details-marker]:hidden">
                  <span className="font-medium">{faq.question}</span>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-all group-open:bg-orange-100 group-open:text-orange-500">
                    <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3 transition-transform group-open:rotate-180">
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </summary>
                <div className="border-t border-gray-100 px-6 py-4 text-sm text-gray-600 leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 to-gray-800 p-12 text-center">
            {/* Decorative elements */}
            <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-orange-500/20 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-orange-500/20 blur-3xl" />

            <div className="relative">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Ready to check your writing?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-gray-400">
                Join thousands of students who understand their writing before they submit.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <LoadingLink
                  href="/signup?redirectedFrom=/detector"
                  className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-600 hover:shadow-xl"
                >
                  Get Started Free
                </LoadingLink>
                <LoadingLink
                  href="/detector"
                  className="inline-flex items-center gap-2 rounded-full border border-gray-600 bg-transparent px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-white/10"
                >
                  Try Demo First
                </LoadingLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white">
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">Veridict</span>
            </div>
            <p className="text-sm text-gray-500">
              Signals over accusations. Probability over certainty.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="/pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
              <a href="/blog" className="hover:text-gray-900 transition-colors">Blog</a>
              <a href="/login" className="hover:text-gray-900 transition-colors">Login</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Signup gate modal */}
      {showGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl">
            <button
              type="button"
              className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowGate(false)}
            >
              <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
                <path d="M6 6l8 8M6 14l8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-orange-500">
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <h3 className="mt-4 text-2xl font-bold text-gray-900">
              See the full analysis
            </h3>
            <p className="mt-2 text-gray-600">
              Create a free account to unlock complete signal breakdowns, revision tracking, and more.
            </p>

            <div className="mt-6 space-y-3">
              <LoadingLink
                href="/signup?redirectedFrom=/detector"
                className="block w-full rounded-full bg-orange-500 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-600"
              >
                Create Free Account
              </LoadingLink>
              <LoadingLink
                href="/login?redirectedFrom=/detector"
                className="block w-full rounded-full border border-gray-200 bg-white py-3 text-center text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50"
              >
                Already have an account? Log in
              </LoadingLink>
            </div>

            <button
              type="button"
              className="mt-4 w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
              onClick={() => setShowGate(false)}
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

import Image from "next/image";
import Link from "next/link";

const RITUALS = [
  {
    title: "Hydration audit",
    text: "A lightweight consultation layer that frames every recommendation around moisture, barrier, and comfort."
  },
  {
    title: "Clinical calm",
    text: "Soft actives, transparent language, and presentation systems made for premium skincare launches."
  },
  {
    title: "Launch clarity",
    text: "Brand, product, and education modules designed to feel quiet, credible, and easy to trust."
  }
];

const PRODUCTS = [
  "Cloud serum",
  "Barrier water cream",
  "Cica mist",
  "Skin rhythm mask"
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7fcfb] text-[#173331]">
      <section className="relative min-h-[calc(100vh-74px)] px-5 pb-16 pt-10 sm:px-8 lg:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(178,225,224,0.5),transparent_28%),linear-gradient(135deg,#fafdF9_0%,#e8f7f6_47%,#f9fcf7_100%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="max-w-2xl pt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.42em] text-[#4f8f8a]">
              Seoul-inspired brand studio
            </p>
            <h1 className="mt-6 text-[clamp(3.1rem,8vw,7.9rem)] font-semibold leading-[0.9] tracking-normal text-[#143735]">
              Veridict
            </h1>
            <p className="mt-8 max-w-xl text-xl leading-8 text-[#456965]">
              A clean skincare showcase for brands that want their product story to feel fresh, precise, and quietly premium.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/detector"
                className="inline-flex rounded-full bg-[#4ea7a2] px-7 py-4 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(78,167,162,0.28)] transition hover:bg-[#367f7b]"
              >
                View presentation
              </Link>
              <Link
                href="/pricing"
                className="inline-flex rounded-full border border-[#b6d9d5] bg-white/65 px-7 py-4 text-sm font-semibold text-[#244a47] transition hover:border-[#7dbbb5] hover:bg-white"
              >
                Brand services
              </Link>
            </div>
            <div className="mt-12 grid max-w-xl grid-cols-3 gap-6 border-t border-[#c7e0dd] pt-8">
              <div>
                <p className="text-2xl font-semibold text-[#173331]">01</p>
                <p className="mt-2 text-xs uppercase tracking-[0.24em] text-[#6d8f8c]">Identity</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-[#173331]">02</p>
                <p className="mt-2 text-xs uppercase tracking-[0.24em] text-[#6d8f8c]">Rituals</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-[#173331]">03</p>
                <p className="mt-2 text-xs uppercase tracking-[0.24em] text-[#6d8f8c]">Launch</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-10 top-10 hidden h-48 w-48 rounded-full border border-[#a9d4cf] lg:block" />
            <div className="relative mx-auto max-w-[560px] overflow-hidden rounded-[36px] border border-white/80 bg-white/55 p-3 shadow-[0_30px_80px_rgba(77,126,121,0.18)] backdrop-blur">
              <Image
                src="/images/veridict/hero-serum.png"
                alt="Minimal aqua green skincare serum presentation for Veridict."
                width={1024}
                height={1280}
                priority
                className="aspect-[4/5] w-full rounded-[28px] object-cover"
              />
            </div>
            <div className="absolute -bottom-5 left-3 rounded-2xl bg-white/85 px-5 py-4 shadow-[0_18px_42px_rgba(65,105,101,0.14)] backdrop-blur">
              <p className="text-xs uppercase tracking-[0.28em] text-[#6a9792]">Main color</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="h-8 w-8 rounded-full bg-[#9fd8d3]" />
                <span className="text-sm font-semibold text-[#173331]">aqua green #9fd8d3</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.36em] text-[#4f8f8a]">
              Presentation system
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-normal text-[#173331] sm:text-5xl">
              Clean visuals for a brand that should feel like skin after water.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {RITUALS.map((item) => (
              <article key={item.title} className="rounded-lg bg-[#f2faf9] p-6">
                <h3 className="text-lg font-semibold text-[#173331]">{item.title}</h3>
                <p className="mt-4 text-sm leading-6 text-[#587773]">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid overflow-hidden rounded-[30px] bg-[#dff2f0] lg:grid-cols-2">
            <div className="p-8 sm:p-12 lg:p-16">
              <p className="text-xs font-semibold uppercase tracking-[0.36em] text-[#4f8f8a]">
                Product world
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-normal text-[#173331] sm:text-6xl">
                Hydration, proof, and softness in one calm page.
              </h2>
              <p className="mt-6 max-w-lg text-base leading-7 text-[#486b67]">
                Veridict now presents as a skincare company showcase: airy surfaces, pale aqua-green accents, editorial product imagery, and concise brand modules.
              </p>
            </div>
            <div className="grid content-end gap-px bg-white/50 p-px sm:grid-cols-2">
              {PRODUCTS.map((product) => (
                <div key={product} className="min-h-44 bg-[#f8fdfc] p-7">
                  <span className="block h-10 w-10 rounded-full bg-gradient-to-br from-[#b9e5e1] to-[#eefaf7]" />
                  <p className="mt-10 text-lg font-semibold text-[#173331]">{product}</p>
                  <p className="mt-2 text-sm text-[#6b8a86]">Presentation image module</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#173331] px-5 py-20 text-white sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.36em] text-[#9fd8d3]">
              Veridict
            </p>
            <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-normal sm:text-6xl">
              A softer, cleaner identity ready for Vercel.
            </h2>
          </div>
          <Link
            href="/signup"
            className="inline-flex w-fit rounded-full bg-[#9fd8d3] px-8 py-4 text-sm font-semibold text-[#173331] transition hover:bg-white"
          >
            Start a project
          </Link>
        </div>
      </section>
    </main>
  );
}

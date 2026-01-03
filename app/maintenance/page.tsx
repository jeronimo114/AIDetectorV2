export default function MaintenancePage() {
  return (
    <main className="relative min-h-screen bg-[#f8f7f1]">
      <div className="mx-auto flex min-h-screen w-full max-w-[720px] flex-col justify-center px-6">
        <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">Maintenance</p>
        <h1 className="mt-4 text-4xl font-semibold text-[#1f1d18]">We are tuning the lab.</h1>
        <p className="mt-3 text-sm text-[#4f4a40]">
          The AI Detector is temporarily in maintenance mode. Please check back shortly.
        </p>
      </div>
    </main>
  );
}

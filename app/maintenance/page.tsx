export default function MaintenancePage() {
  return (
    <main className="relative min-h-screen bg-[#f7f7f4]">
      <div className="mx-auto flex min-h-screen w-full max-w-[720px] flex-col justify-center px-6">
        <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">Maintenance</p>
        <h1 className="mt-4 text-4xl font-semibold text-[#1f1f1c]">
          Veridict is temporarily unavailable.
        </h1>
        <p className="mt-3 text-sm text-[#4c4b45]">
          We are performing maintenance. Please check back shortly.
        </p>
      </div>
    </main>
  );
}

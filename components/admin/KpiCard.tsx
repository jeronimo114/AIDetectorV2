type KpiCardProps = {
  label: string;
  value: string | number;
  hint?: string;
};

export default function KpiCard({ label, value, hint }: KpiCardProps) {
  return (
    <div className="rounded-3xl border border-[#d6d2c6] bg-white/80 p-5 shadow-[0_14px_40px_rgba(27,24,19,0.08)] backdrop-blur">
      <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-[#1f1d18]">{value}</p>
      {hint && <p className="mt-2 text-xs text-[#6a6459]">{hint}</p>}
    </div>
  );
}

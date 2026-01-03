type StatusPillProps = {
  tone: "neutral" | "success" | "warning" | "danger";
  label: string;
};

const tones = {
  neutral: "bg-[#efe9d9] text-[#6a5b3f] border border-[#e0d6bf]",
  success: "bg-[#e6f2dd] text-[#1f3b1f] border border-[#c6e0b5]",
  warning: "bg-[#f7f1d6] text-[#6a5b3f] border border-[#e7d8a9]",
  danger: "bg-[#f7d9d2] text-[#712d21] border border-[#edb8aa]"
};

export default function StatusPill({ tone, label }: StatusPillProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}>
      {label}
    </span>
  );
}

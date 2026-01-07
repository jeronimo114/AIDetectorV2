type StatusPillProps = {
  tone: "neutral" | "success" | "warning" | "danger" | "info";
  label: string;
};

const tones = {
  neutral: "bg-gray-100 text-gray-700 border border-gray-200",
  success: "bg-green-50 text-green-700 border border-green-200",
  warning: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  danger: "bg-red-50 text-red-700 border border-red-200",
  info: "bg-blue-50 text-blue-700 border border-blue-200"
};

const dots = {
  neutral: "bg-gray-400",
  success: "bg-green-500",
  warning: "bg-yellow-500",
  danger: "bg-red-500",
  info: "bg-blue-500"
};

export default function StatusPill({ tone, label }: StatusPillProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${tones[tone]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dots[tone]}`} />
      {label}
    </span>
  );
}

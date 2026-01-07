type KpiCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
};

export default function KpiCard({ label, value, hint, icon, trend }: KpiCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
            {icon}
          </div>
        )}
      </div>
      <p className="mt-3 text-3xl font-bold text-gray-900">{value}</p>
      {(hint || trend) && (
        <div className="mt-2 flex items-center gap-2">
          {trend && (
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium ${
                trend.positive ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.positive ? (
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                </svg>
              )}
              {trend.value > 0 ? "+" : ""}{trend.value}%
            </span>
          )}
          {hint && <p className="text-xs text-gray-500">{hint}</p>}
        </div>
      )}
    </div>
  );
}

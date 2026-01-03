type FilterBarProps = {
  children: React.ReactNode;
};

export default function FilterBar({ children }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-[#d6d2c6] bg-white/80 p-4 shadow-[0_12px_40px_rgba(27,24,19,0.06)] backdrop-blur">
      {children}
    </div>
  );
}

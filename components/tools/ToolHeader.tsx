interface ToolHeaderProps {
  badge: string;
  h1: string;
  subheading: string;
}

export default function ToolHeader({ badge, h1, subheading }: ToolHeaderProps) {
  return (
    <header className="opacity-0 animate-fade-up">
      <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2">
        <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
        <span className="text-sm font-medium text-orange-700">{badge}</span>
      </div>
      <h1 className="mt-5 text-4xl font-bold text-gray-900 sm:text-5xl">
        {h1}
      </h1>
      <p className="mt-4 max-w-xl text-lg text-gray-600">
        {subheading}
      </p>
    </header>
  );
}

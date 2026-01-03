type JsonViewerProps = {
  value: unknown;
};

export default function JsonViewer({ value }: JsonViewerProps) {
  return (
    <pre className="max-h-80 overflow-auto rounded-2xl bg-[#f1eee6] p-4 text-xs text-[#2a2822]">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

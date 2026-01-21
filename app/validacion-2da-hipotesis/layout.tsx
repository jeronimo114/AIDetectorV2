export default function SurveyLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style>{`
        header, footer, [data-site-header], [data-site-footer] {
          display: none !important;
        }
      `}</style>
      {children}
    </>
  );
}

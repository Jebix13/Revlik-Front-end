export default function StatTile({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string;
  sublabel?: string;
}) {
  return (
    <div className="rounded-xl border border-black/10 bg-[#fcfcfb] p-4 dark:border-white/10 dark:bg-[#1a1a19]">
      <p className="text-sm text-[#52514e] dark:text-[#c3c2b7]">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-[#0b0b0b] dark:text-white">
        {value}
      </p>
      {sublabel && (
        <p className="mt-0.5 text-xs text-[#898781]">{sublabel}</p>
      )}
    </div>
  );
}

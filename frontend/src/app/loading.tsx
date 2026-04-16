export default function GlobalLoading() {
  return (
    <div className="section-wrap py-10">
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-56 rounded-lg bg-white/[0.08]" />
        <div className="h-4 w-80 rounded bg-white/[0.06]" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((id) => (
            <div key={id} className="glass-card h-44" />
          ))}
        </div>
      </div>
    </div>
  );
}

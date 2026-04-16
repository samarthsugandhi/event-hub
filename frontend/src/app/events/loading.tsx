export default function EventsLoading() {
  return (
    <div className="section-wrap py-8">
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded-lg bg-white/[0.08]" />
        <div className="h-12 w-full rounded-xl bg-white/[0.06]" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((id) => (
            <div key={id} className="glass-card h-56" />
          ))}
        </div>
      </div>
    </div>
  );
}

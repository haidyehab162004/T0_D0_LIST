export default function DashboardProgres({ completed = 1, total = 5 }) {
  const percentage =
    total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <section className="app-card rounded-2xl border p-7 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">Overall Progress</h2>
        <span className="font-bold text-blue-600">{percentage}%</span>
      </div>

      <div
        className="app-track h-3 w-full overflow-hidden rounded-full"
        role="progressbar"
        aria-valuenow={percentage}  
        aria-valuemin={0}
        aria-valuemax={100}
      >

        
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-300 transition-all"
          style={{ width: `${percentage}%` }}
        />


      </div>

      <p className="app-muted mt-3 text-sm">
        {completed} of {total} tasks completed
      </p>
    </section>
  );
}

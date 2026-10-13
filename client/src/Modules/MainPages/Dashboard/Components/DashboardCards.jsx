import { Icon } from "@iconify/react";

const cards = [
  {
    value: 5,
    label: "Total Tasks",
    icon: "lucide:list-todo",
    color: "blue",
    border: "border-l-4 border-blue-500",
  },
  {
    value: 4,
    label: "Pending",
    icon: "lucide:clock-3",
    color: "orange",
    border: "border-l-4 border-orange-500",
  },
  {
    value: 1,
    label: "Completed",
    icon: "lucide:circle-check",
    color: "green",
    border: "border-l-4 border-green-600",
  },
];

const colors = {
  blue: "bg-blue-100 text-blue-600",
  orange: "bg-amber-100 text-amber-600",
  green: "bg-emerald-100 text-emerald-600",
};

export default function DashboardCards() {
  return (
    <div className="mt-12  grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`app-card min-h-48 w-full rounded-2xl p-4 shadow-sm ${card.border}`}
        >
          <div
            className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${colors[card.color]}`}
          >
            <Icon icon={card.icon} width="28" height="28" />
          </div>

          <h2 className="mb-1 text-4xl font-bold">
            {card.value}
          </h2>
          <p className="app-muted text-sm">{card.label}</p>
        </div>
      ))}
    </div>
  );
}

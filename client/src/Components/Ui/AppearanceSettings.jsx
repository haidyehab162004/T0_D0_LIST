import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

export default function AppearanceSettings() {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <div>
      <h2 className="app-muted mb-3 text-sm font-bold tracking-wider">
        APPEARANCE
      </h2>

      <section className="app-card mb-7 flex items-center justify-between rounded-2xl border p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <Icon icon={darkMode ? "lucide:moon" : "lucide:sun"} width="28" />
          </div>

          <div>
            <h3 className="font-semibold">
              Dark Mode
            </h3>
            <p className="app-muted mt-1">
              Currently using {darkMode ? "dark" : "light"} theme
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDarkMode((current) => !current)}
          aria-label="Toggle dark mode"
          aria-pressed={darkMode}
          className={`relative h-10 w-16 rounded-full transition ${
            darkMode ? "bg-violet-600" : "bg-gray-200"
          }`}
        >
          <span
            className={`absolute top-1 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow transition-all ${
              darkMode ? "left-7" : "left-1"
            }`}
          >
            <Icon
              icon={darkMode ? "lucide:moon" : "lucide:sun"}
              width="17"
              className="text-amber-600"
            />
          </span>
        </button>
      </section>
    </div>
  );
}

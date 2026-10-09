import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase.js";

const links = [
  { label: "Dashboard", path: "/dashboard", icon: "mdi:view-dashboard-outline" },
  { label: "My Tasks", path: "/tasks", icon: "mdi:checkbox-marked-outline" },
  { label: "Important", path: "/important", icon: "mdi:star-outline" },
  { label: "Completed", path: "/completed", icon: "mdi:check-circle-outline" },
  { label: "Categories", path: "/categories", icon: "mdi:tag-outline" },
  { label: "Settings", path: "/settings", icon: "mdi:cog-outline" },
];

export default function Sidebar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (active && !error) {
        setUser(data.session?.user ?? null);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Sign-out error:", error.message);
      return;
    }

    navigate("/login");
  }

  const name =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Account";

  const email = user?.email || "";
  const initial = name.charAt(0).toUpperCase();

  const avatarUrl =
    user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture;

 
  return (
    <aside className="flex min-h-screen w-80 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-3 border-b border-slate-200 p-5">
        <div className="rounded-2xl bg-violet-600 p-3 text-white">
          <Icon icon="mdi:format-list-checks" width="28" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-violet-600">DoList</h1>
          <p className="text-sm text-slate-500">Stay organized</p>
        </div>
      </div>

      <nav className="flex-1 p-3">
        <p className="mb-3 px-3 text-sm font-semibold text-slate-500">MENU</p>

        <div className="space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === "/dashboard"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 transition ${isActive
                  ? "bg-violet-600 font-semibold text-white shadow-lg"
                  : "text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                }`
              }
            >
              <Icon icon={link.icon} width="22" />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${name}'s profile`}
              className="size-11 shrink-0 rounded-2xl object-fit"
            />
          ) : (
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-500 font-bold text-white">
              {initial}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{name}</p>
            <p className="truncate text-sm text-slate-500">{email}</p>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            aria-label="Sign out"
            title="Sign out"
            className="text-slate-500 hover:text-violet-700"
          >
            <Icon icon="mdi:logout" width="22" />
          </button>
        </div>
      </div>
    </aside>
  );
}
import { Outlet } from "react-router-dom";
import Sidebar from "../Shared/Sidebar/Sidebar";

export default function Layout() {
  return (
    <div className="min-h-screen app-page md:flex">
      <Sidebar />

      <main className="min-w-0 flex-1 p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
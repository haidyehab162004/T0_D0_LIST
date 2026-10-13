import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase.js";
import SrkittsDynamicGreeting from "../../../lib/SrkittsDynamicGreeting.jsx";
import DashboardCards from "./Components/DashboardCards.jsx";
import DashboardProgras from "./Components/DashboardProgras.jsx";

export default function Dashboard() {
  const [name, setName] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Failed to get user:", error);
        return;
      }

      if (user) {
        const userName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "Account";

        setName(userName.split(" ")[0]);
      }
    };

    getUser();
  }, []);

  return (
    <div className="app-page min-h-screen p-6 pl-20">
      <h1 className="text-3xl font-bold">
         {name && <SrkittsDynamicGreeting name={name.split(" ")[0]} />}
      </h1>
      <p className="app-muted pt-0.5">
        Here's a summary of your tasks today.
      </p>
      <div className="mr-6 flex flex-col gap-10 ">
        <DashboardCards />
        <DashboardProgras completed={1} total={5} />
      </div>

     
    </div>
  );
}

import Layout from "../layouts/layouts.jsx";
import Dashboard from "../Modules/MainPages/Dashboard/Dashboard.jsx";
import LoginForm from "../Modules/MainPages/Login/LoginForm.jsx";
import MyTasks from "../Modules/MainPages/MyTasks/MyTasks.jsx";
 import RegisterForm from "../Modules/MainPages/Register/RegisterForm.jsx";
import { Route, Routes } from "react-router-dom";

function PlaceholderPage({ title }) {
  return <h1 className="text-3xl font-bold">{title}</h1>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginForm />} />
      <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
      <Route element={<Layout />}>
         <Route path="/dashboard" element={<Dashboard />} />
        <Route path="tasks" element={<MyTasks />} />
        <Route path="important" element={<PlaceholderPage title="Important" />} />
        <Route path="completed" element={<PlaceholderPage title="Completed" />} />
        <Route path="categories" element={<PlaceholderPage title="Categories" />} />
        <Route path="settings" element={<PlaceholderPage title="Settings" />} />
      </Route>
    </Routes>
  );
}
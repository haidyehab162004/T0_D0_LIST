import Layout from "../layouts/layouts.jsx";
import Dashboard from "../Modules/MainPages/Dashboard/Dashboard.jsx";
import ForgotPassword from "../Modules/MainPages/Login/Components/ForgotPassword.jsx";
import LoginForm from "../Modules/MainPages/Login/LoginForm.jsx";
import MyTasks from "../Modules/MainPages/MyTasks/MyTasks.jsx";
import VerifyEmail from "../Modules/MainPages/Register/components/VerifyEmail.jsx";
 import RegisterForm from "../Modules/MainPages/Register/RegisterForm.jsx";
import Settings from "../Modules/MainPages/Settings/Settings.jsx";
import { Route, Routes } from "react-router-dom";
import CheckEmail from "../Modules/MainPages/Login/Components/CheckEmail.jsx";
import ResetPassword from "../Modules/MainPages/Login/Components/ResetPassword.jsx";
function PlaceholderPage({ title }) {
  return <h1 className="text-3xl font-bold">{title}</h1>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginForm />} />
      <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/verify-email" element={<VerifyEmail/>} />
        <Route path="/forgotPassword" element={<ForgotPassword/>}/>
        <Route path="/check-email" element={<CheckEmail/>}/>
        <Route path="/reset-password" element={<ResetPassword/>}/>
      <Route element={<Layout />}>
         <Route path="/dashboard" element={<Dashboard />} />
        <Route path="tasks" element={<MyTasks />} />
        <Route path="important" element={<PlaceholderPage title="Important" />} />
        <Route path="completed" element={<PlaceholderPage title="Completed" />} />
        <Route path="categories" element={<PlaceholderPage title="Categories" />} />
        <Route path="/settings" element={<Settings />} />

      </Route>
    </Routes>
  );
}
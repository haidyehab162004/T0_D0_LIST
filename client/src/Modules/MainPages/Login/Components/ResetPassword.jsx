import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { authApi } from "../../../Auth/authApi";

export default function ResetPassword() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const resetToken = state?.resetToken;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const hasMinLength = password.length >= 8;
  const hasSpecialCharacter = /[^A-Za-z0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    if (!resetToken) {
      setFormError("جلسة إعادة التعيين غير صالحة. ابدئي طلبًا جديدًا.");
      return;
    }

    if (!hasMinLength || !hasSpecialCharacter || !passwordsMatch) {
      setFormError("تأكدي من شروط كلمة المرور وتطابق الحقلين.");
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({ resetToken, newPassword: password });
      navigate("/login", { replace: true });
    } catch (error) {
      setFormError(
        error.response?.data?.message || "تعذر إعادة تعيين كلمة المرور. حاولي مرة أخرى."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-page flex min-h-screen justify-center px-4 pt-8">
      <section className="w-full max-w-sm">
        <div className="mb-4 flex justify-center">
          <div className="app-card flex h-10 w-10 items-center justify-center rounded-lg border text-gray-700">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect x="5" y="10" width="14" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              <circle cx="12" cy="15" r="1" />
            </svg>
          </div>
        </div>

        <h1 className="text-center text-2xl font-bold">Set a new password</h1>
        <p className="app-muted mb-6 mt-2 text-center text-sm">
          Your new password must be different from
          <br />
          previously used passwords
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-xs font-medium">
            Password
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="app-input block w-full rounded-lg border px-3 py-2.5 pr-10 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                required
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <Icon icon={showPassword ? "mdi:eye-off-outline" : "mdi:eye-outline"} width="20" height="20" />
              </button>
            </div>
          </label>

          <label className="block text-xs font-medium">
            Confirm password
            <div className="relative mt-1">
              <input
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="app-input block w-full rounded-lg border px-3 py-2.5 pr-10 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                required
              />
              <button
                type="button"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                onClick={() => setShowConfirmPassword((visible) => !visible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <Icon icon={showConfirmPassword ? "mdi:eye-off-outline" : "mdi:eye-outline"} width="20" height="20" />
              </button>
            </div>
          </label>

          <ul className="space-y-1 pt-1 text-xs">
            <li className={hasMinLength ? "text-green-700" : "app-muted"}>
              {hasMinLength ? "✓" : "○"} Must be at least 8 characters
            </li>
            <li className={hasSpecialCharacter ? "text-green-700" : "app-muted"}>
              {hasSpecialCharacter ? "✓" : "○"} Must contain one special character
            </li>
            {confirmPassword && (
              <li className={passwordsMatch ? "text-green-700" : "text-red-600"}>
                {passwordsMatch ? "✓" : "○"} Passwords must match
              </li>
            )}
          </ul>

          {formError && (
            <p role="alert" className="text-sm text-red-600">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !hasMinLength || !hasSpecialCharacter || !passwordsMatch}
            className="w-full rounded-lg bg-blue-700 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Resetting password..." : "Reset password"}
          </button>
        </form>

        <NavLink
          to="/login"
          className="app-muted mt-5 flex items-center justify-center gap-2 text-xs font-medium hover:text-blue-700"
        >
          <span aria-hidden="true">←</span>
          Back to login
        </NavLink>
      </section>
    </main>
  );
}

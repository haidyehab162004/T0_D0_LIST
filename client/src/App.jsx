import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "./Modules/Auth/useAuth.js";

export default function App() {
  const { user, googleLogin, logout } = useAuth();

  async function handleGoogleSuccess(credentialResponse) {
    try {
      const result = await googleLogin(credentialResponse.credential);

      console.log("Backend Google login response:", result);
    } catch (error) {
      console.error("Google login failed:", error.response?.data ?? error);
    }
  }

  if (user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Logged in</h1>

        <p>{user.name}</p>
        <p>{user.email}</p>

        <button
          type="button"
          onClick={logout}
          className="rounded bg-black px-4 py-2 text-white"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-bold">Test Google Login</h1>

      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => {
          console.error("Google login popup failed");
        }}
      />
    </div>
  );
}

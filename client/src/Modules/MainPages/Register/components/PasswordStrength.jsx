export default function PasswordStrength({ password }) {
  if (!password) return null;

  const checks = [
    password.length >= 6,
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]|[^A-Za-z0-9]/.test(password),
  ];

  const strength = checks.filter(Boolean).length;

  const label =
    strength <= 1 ? "Weak" : strength <= 3 ? "Medium" : "Strong";

  const barColor =
    strength <= 1
      ? "bg-red-500"
      : strength <= 3
        ? "bg-yellow-500"
        : "bg-green-500";

  const textColor =
    strength <= 1
      ? "text-red-500"
      : strength <= 3
        ? "text-yellow-600"
        : "text-green-600";

  return (
    <div className="-mt-2 mb-4 px-1">
      <div className="grid grid-cols-4 gap-1">
        {[0, 1, 2, 3].map((bar) => (
          <span
            key={bar}
            className={`h-1 rounded-full ${
              bar < strength ? barColor : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      <p className={`mt-2 text-sm ${textColor}`}>
        Password strength: {label}
      </p>
    </div>
  );
}
import { useState } from "react";
import { apiFetch } from "../api/client";
import { UserPlus, Mail, Lock, User, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // basis validations
  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) => password.length >= 6;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // validations before sending
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!validatePassword(password)) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }

    try {
      setLoading(true);

      const response = await apiFetch("/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
        }),
      });

      console.log("Registered user:", response);
      setSuccess(`User ${response.email} registered successfully!`);

      // clear form
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
    } catch (err: any) {
      console.error("Registration error:", err);

      if (err?.status === 400 && err?.errors?.email) {
        setError(`Email already registered: ${err.errors.email.join(", ")}`);
      } else {
        setError(
          err?.message || "Error registering user. Please check your data."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="border-2 border-green-400/30 bg-slate-900/50 p-6 mb-6">
        <div className="flex items-center gap-3">
          <UserPlus className="w-8 h-8 text-green-400" />
          <div>
            <h1 className="text-2xl font-mono text-green-400 tracking-wider m-0">
              REGISTRO DE NUEVO AGENTE
            </h1>
            <p className="text-green-400/50 font-mono text-xs tracking-wide mt-1">
              Complete los datos para crear una nueva cuenta
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="border-2 border-green-400/30 bg-slate-900/50 p-8 max-w-2xl">
        <form onSubmit={handleRegister} className="space-y-6">
          {/* Email */}
          <div>
            <label className="flex items-center gap-2 text-green-400 font-mono text-xs tracking-wider mb-2">
              <Mail className="w-4 h-4" />
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              placeholder="agente@agency.gov"
              className="w-full bg-slate-950 border border-green-400/30 text-green-400 font-mono px-4 py-3 focus:outline-none focus:border-green-400 transition-colors placeholder-green-400/30"
            />
          </div>

          {/* Password */}
          <div>
            <label className="flex items-center gap-2 text-green-400 font-mono text-xs tracking-wider mb-2">
              <Lock className="w-4 h-4" />
              CONTRASEÑA
            </label>
            <input
              type="password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-green-400/30 text-green-400 font-mono px-4 py-3 focus:outline-none focus:border-green-400 transition-colors placeholder-green-400/30"
            />
            <p className="text-green-400/50 font-mono text-xs mt-2">
              Mínimo 6 caracteres
            </p>
          </div>

          {/* First Name */}
          <div>
            <label className="flex items-center gap-2 text-green-400 font-mono text-xs tracking-wider mb-2">
              <User className="w-4 h-4" />
              NOMBRE
            </label>
            <input
              type="text"
              value={firstName}
              required
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
              className="w-full bg-slate-950 border border-green-400/30 text-green-400 font-mono px-4 py-3 focus:outline-none focus:border-green-400 transition-colors placeholder-green-400/30"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="flex items-center gap-2 text-green-400 font-mono text-xs tracking-wider mb-2">
              <User className="w-4 h-4" />
              APELLIDO
            </label>
            <input
              type="text"
              value={lastName}
              required
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
              className="w-full bg-slate-950 border border-green-400/30 text-green-400 font-mono px-4 py-3 focus:outline-none focus:border-green-400 transition-colors placeholder-green-400/30"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 bg-red-950/30 border border-red-500/50 p-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-mono text-sm tracking-wide">
                {error}
              </span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-2 bg-green-900/30 border border-green-400/50 p-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-mono text-sm tracking-wide">
                {success}
              </span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-green-400/10 border-2 border-green-400/50 hover:bg-green-400/20 text-green-400 font-mono px-6 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed tracking-wider"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>REGISTRANDO...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                <span>REGISTRAR AGENTE</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
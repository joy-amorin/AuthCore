import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { Shield, Mail, Lock, LogIn, AlertCircle } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/panel/home");
    } catch (err) {
      setError("ACCESO DENEGADO: Credenciales inválidas");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Shield className="w-16 h-16 text-green-400" />
          </div>
          <h1 className="text-3xl font-mono text-green-400 tracking-widest mb-2">
            SISTEMA DE ACCESO
          </h1>
          <p className="text-green-400/50 font-mono text-xs tracking-wider">
            // AUTENTICACIÓN REQUERIDA //
          </p>
        </div>

        {/* Login Form */}
        <div className="border-2 border-green-400/30 bg-slate-900/50 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="flex items-center gap-2 text-green-400 font-mono text-sm mb-2 tracking-wide">
                <Mail className="w-4 h-4" />
                <span>IDENTIFICACIÓN</span>
              </label>
              <input
                type="email"
                placeholder="agente@agency.gov"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-green-400/30 text-green-400 font-mono px-4 py-3 focus:outline-none focus:border-green-400 transition-colors placeholder-green-400/30"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="flex items-center gap-2 text-green-400 font-mono text-sm mb-2 tracking-wide">
                <Lock className="w-4 h-4" />
                <span>CÓDIGO DE ACCESO</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-green-400/30 text-green-400 font-mono px-4 py-3 focus:outline-none focus:border-green-400 transition-colors placeholder-green-400/30"
                required
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

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-green-400/10 border-2 border-green-400/50 hover:bg-green-400/20 text-green-400 font-mono px-6 py-3 transition-colors tracking-wider"
            >
              <LogIn className="w-5 h-5" />
              <span>INICIAR SESIÓN</span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-green-400/30 font-mono text-xs tracking-widest">
          <p>// SISTEMA SEGURO v2.0 - CLASIFICADO //</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
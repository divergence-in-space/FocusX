import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User as UserIcon, ArrowLeft, Zap } from "lucide-react";
import AuthBackground from "@/components/AuthBackground";


/* ─── SSO Icons ─── */
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);
const GithubIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.699-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);
const AppleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.126 3.822 3.08 1.567-.05 2.169-.95 4.091-.95 1.91 0 2.464.953 4.104.922 1.679-.027 2.704-1.526 3.702-2.986 1.157-1.692 1.636-3.333 1.66-3.417-.035-.013-3.182-1.226-3.21-4.88-.026-3.05 2.493-4.53 2.6-4.593-1.422-2.083-3.623-2.37-4.423-2.433-2.029-.118-3.968 1.25-5.025 1.25-1.056 0-2.618-1.127-4.06-1.127h.141zM15.46 3.518c.84-.972 1.4-2.324 1.246-3.674-1.168.047-2.604.772-3.472 1.776-.777.884-1.442 2.275-1.265 3.593 1.3-.05 2.651-.722 3.49-1.695h.001z" />
  </svg>
);

/* ─── Glowing Logo ─── */
const GlowLogo = () => (
  <div className="flex flex-col items-center gap-2 mb-2">
    <div className="relative">
      {/* Outer neon ring */}
      <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 opacity-40 blur-md animate-pulse" />
      <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 p-[2px] shadow-[0_0_20px_rgba(168,85,247,0.5)]">
        <div className="w-full h-full rounded-full bg-[#0a0a1a]/80 flex items-center justify-center backdrop-blur-sm">
          <Zap className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  </div>
);

/* ─── Input field ─── */
const inputCls =
  "w-full pl-11 pr-4 py-3 rounded-full text-sm font-medium text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/25 transition-all autofill-fix " +
  "bg-[rgba(10,10,25,0.6)] border border-white/15 backdrop-blur-sm shadow-[inset_0_1px_4px_rgba(0,0,0,0.4)]";

/* ─── Auth Component ─── */
const Auth = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  /* Form state */
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* Mobile toggle (on small screens we show one at a time) */
  const [mobileView, setMobileView] = useState<"login" | "signup">("login");

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  /* ── Handlers ── */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (error) throw error;
      toast.success("Welcome back, adventurer!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: { data: { name: signupName } },
      });
      if (error) throw error;
      toast.success("Account created! Your adventure begins.");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const sso = (p: string) => toast(`${p} login coming soon`, { icon: "ℹ️" });

  /* ─── Shared Card Shell ─── */
  const Card = ({
    children,
    className = "",
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div
      className={
        "relative rounded-[28px] border border-white/[0.08] bg-[rgba(8,8,22,0.35)] backdrop-blur-[16px] p-7 shadow-[0_8px_40px_rgba(0,0,0,0.45)] overflow-hidden auth-neon-card " +
        className
      }
    >
      {children}
    </div>
  );

  /* ─── Blue divider ─── */
  const BlueDivider = () => (
    <div className="relative mt-3 mb-5 mx-auto w-3/4 h-px">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/70 to-transparent" />
      <div className="absolute left-1/2 -translate-x-1/2 -top-[3px] w-2 h-2 rounded-full bg-white shadow-[0_0_10px_4px_rgba(96,165,250,0.9)]" />
    </div>
  );

  /* ─── SSO Row ─── */
  const SSORow = () => (
    <>
      <div className="flex items-center gap-3 my-4">
        <span className="flex-1 h-px bg-white/10" />
        <span className="text-[10px] text-white/35 font-medium uppercase tracking-widest whitespace-nowrap">
          Or Continue with
        </span>
        <span className="flex-1 h-px bg-white/10" />
      </div>
      <div className="flex justify-center gap-3">
        {[
          { id: "google", Icon: GoogleIcon },
          { id: "github", Icon: GithubIcon },
          { id: "apple", Icon: AppleIcon },
        ].map(({ id, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => sso(id)}
            className="w-11 h-10 rounded-xl flex items-center justify-center bg-[rgba(10,10,25,0.5)] border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
          >
            <Icon />
          </button>
        ))}
      </div>
    </>
  );

  /* ═══════════════════════════════════════════ */
  /*                   RENDER                    */
  /* ═══════════════════════════════════════════ */
  return (
    <div className="min-h-screen relative overflow-hidden text-white font-sans">
      {/* ── 3D Animated Background ── */}
      <AuthBackground />

      {/* ── Petals (REMOVED) ── */}
      {/* ── Back ── */}
      <Link
        to="/"
        className="absolute top-5 left-5 z-50 flex items-center gap-1.5 text-white/50 hover:text-white text-xs font-semibold uppercase tracking-widest transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      {/* ═══════ Reconfigured Unified Auth Card ═══════ */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-[440px]">
          {/* Login Card */}
          <div style={{ display: mobileView === "login" ? "block" : "none" }}>
                <Card>
                  <GlowLogo />
                  <p className="text-center text-lg font-bold tracking-wide mb-0.5">FocusX</p>
                  <h2 className="text-center text-2xl font-bold tracking-wide">Welcome to FocusX</h2>
                  <p className="text-center text-white/60 text-sm font-medium mt-1">
                    Unlock Your Potential
                  </p>
                  <BlueDivider />

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                      <input
                        id="login-email"
                        type="email"
                        placeholder="Email / Username"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        autoComplete="email"
                        className={inputCls}
                      />
                      <ChevronRight />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                      <input
                        id="login-password"
                        type="password"
                        placeholder="Password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        minLength={6}
                        autoComplete="current-password"
                        className={inputCls}
                      />
                      <ChevronRight />
                    </div>

                    <GlowButton color="green" label={submitting ? "..." : "Login"} />
                  </form>

                  <SSORow />

                  <p className="text-center text-[12px] text-white/40 mt-6 font-medium">
                    New adventurer?{" "}
                    <button
                      onClick={() => setMobileView("signup")}
                      className="text-cyan-300 font-bold hover:underline transition-all"
                    >
                      Create Account
                    </button>
                  </p>
                </Card>
          </div>

          {/* Signup Card */}
          <div style={{ display: mobileView === "signup" ? "block" : "none" }}>
                <Card>
                  <GlowLogo />
                  <h2 className="text-center text-2xl font-bold tracking-wide mt-1">
                    Create Account
                  </h2>
                  <p className="text-center text-white/60 text-sm font-medium mt-1">
                    Start your journey with FocusX
                  </p>
                  <BlueDivider />

                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                      <input
                        id="signup-name"
                        placeholder="Username"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        autoComplete="name"
                        className={inputCls}
                      />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                      <input
                        id="signup-email"
                        type="email"
                        placeholder="Email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                        autoComplete="email"
                        className={inputCls}
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                      <input
                        id="signup-password"
                        type="password"
                        placeholder="Password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        minLength={6}
                        autoComplete="new-password"
                        className={inputCls}
                      />
                    </div>

                    <GlowButton color="orange" label={submitting ? "..." : "Sign Up"} />
                  </form>

                  <p className="text-center text-[12px] text-white/40 mt-6 font-medium">
                    Already registered?{" "}
                    <button
                      onClick={() => setMobileView("login")}
                      className="text-cyan-300 font-bold hover:underline transition-all"
                    >
                      Login Here
                    </button>
                  </p>
                </Card>
          </div>
        </div>
      </div>

      {/* ── Autofill override ── */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .autofill-fix:-webkit-autofill,
        .autofill-fix:-webkit-autofill:hover,
        .autofill-fix:-webkit-autofill:focus,
        .autofill-fix:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 40px rgba(10,10,25,0.9) inset !important;
          -webkit-text-fill-color: #fff !important;
          caret-color: #fff;
          border-color: rgba(255,255,255,0.15) !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `,
        }}
      />
    </div>
  );
};

/* ─── Small chevron for input ─── */
const ChevronRight = () => (
  <svg
    className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-white/25 pointer-events-none"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.5}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

/* ─── Glow Button ─── */
const GlowButton = ({ color, label }: { color: "green" | "orange"; label: string }) => {
  const isGreen = color === "green";
  return (
    <button
      type="submit"
      className="relative w-full mt-1 rounded-full overflow-hidden active:scale-[0.97] transition-transform"
    >
      {/* Background gradient */}
      <div
        className={`absolute inset-0 ${
          isGreen
            ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500"
            : "bg-gradient-to-r from-amber-500 via-orange-400 to-pink-500"
        }`}
      />
      {/* Specular highlight */}
      <div className="absolute top-0 inset-x-[12%] h-[42%] bg-gradient-to-b from-white/35 to-transparent rounded-b-full blur-[0.5px]" />
      {/* Outer glow */}
      <div
        className={`absolute -inset-[2px] rounded-full blur-md -z-10 ${
          isGreen ? "bg-emerald-400/25" : "bg-orange-400/25"
        }`}
      />
      <span className="relative block py-3 text-white font-bold text-base tracking-wide drop-shadow-md">
        {label}
      </span>
    </button>
  );
};

export default Auth;

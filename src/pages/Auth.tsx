import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Mail, Lock, KeyRound, ShieldCheck, CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import DMLogo from "@/components/DMLogo";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";

type Step = "login" | "signup" | "forgot" | "verify";

interface VerifyStep {
  label: string;
  status: "pending" | "active" | "done" | "error";
}

export default function Auth() {
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();
  const [step, setStep] = useState<Step>("login");
  const [loading, setLoading] = useState(false);
  const [emailPrefix, setEmailPrefix] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Verification progress state
  const [verifySteps, setVerifySteps] = useState<VerifyStep[]>([
    { label: "Sending verification email…", status: "pending" },
    { label: "Verifying your IIMB account…", status: "pending" },
    { label: "Verified! Welcome to Digi Mitra", status: "pending" },
  ]);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const email = `${emailPrefix}@iimb.ac.in`;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase
          .from("profiles")
          .select("email_verified")
          .eq("user_id", session.user.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data?.email_verified) {
              navigate("/");
            } else if (data) {
              setStep("verify");
              runAutoVerify();
            }
          });
      }
    });
  }, [navigate]);

  const resetVerifySteps = () => {
    setVerifySteps([
      { label: "Sending verification email…", status: "pending" },
      { label: "Verifying your IIMB account…", status: "pending" },
      { label: "Verified! Welcome to Digi Mitra", status: "pending" },
    ]);
    setVerifyError(null);
  };

  const updateVerifyStep = (index: number, status: VerifyStep["status"]) => {
    setVerifySteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, status } : s))
    );
  };

  const runAutoVerify = useCallback(async () => {
    resetVerifySteps();
    setVerifyError(null);

    // Step 1: Sending email
    updateVerifyStep(0, "active");
    await new Promise((r) => setTimeout(r, 600));

    try {
      const { data, error } = await supabase.functions.invoke("send-verification-code");

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      updateVerifyStep(0, "done");

      // Step 2: Verifying
      updateVerifyStep(1, "active");
      await new Promise((r) => setTimeout(r, 800));

      if (data?.verified) {
        updateVerifyStep(1, "done");

        // Step 3: Success
        updateVerifyStep(2, "done");
        await refreshProfile();

        // Brief pause to show success
        await new Promise((r) => setTimeout(r, 1500));
        toast.success("Email verified! Welcome to Digi Mitra!");
        navigate("/");
      } else {
        throw new Error(data?.error || "Verification failed");
      }
    } catch (err: any) {
      console.error("Auto-verify error:", err);
      const errorMsg = err.message || "Verification failed. Please try again.";
      setVerifyError(errorMsg);
      // Mark current active step as error
      setVerifySteps((prev) =>
        prev.map((s) => (s.status === "active" ? { ...s, status: "error" } : s))
      );
    }
  }, [navigate, refreshProfile]);

  const loginWithPassword = useCallback(async () => {
    if (!emailPrefix.trim() || !password) { toast.error("Please enter email and password"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Login failed");
      const { data: prof } = await supabase
        .from("profiles")
        .select("email_verified")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (prof?.email_verified) {
        toast.success("Welcome back!");
        navigate("/");
      } else {
        setStep("verify");
        runAutoVerify();
      }
    } catch (error: any) { toast.error(error.message || "Invalid credentials"); }
    finally { setLoading(false); }
  }, [email, emailPrefix, password, navigate, runAutoVerify]);

  const signUpWithPassword = useCallback(async () => {
    if (!emailPrefix.trim()) { toast.error("Please enter your email prefix"); return; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (password !== confirmPassword) { toast.error("Passwords don't match"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      setStep("verify");
      // Small delay to let profile trigger fire
      await new Promise((r) => setTimeout(r, 1000));
      await runAutoVerify();
    } catch (error: any) { toast.error(error.message || "Signup failed"); }
    finally { setLoading(false); }
  }, [email, emailPrefix, password, confirmPassword, runAutoVerify]);

  const resetPassword = useCallback(async () => {
    if (!emailPrefix.trim()) { toast.error("Please enter your email prefix"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Password reset link sent! Check your email.");
    } catch (error: any) { toast.error(error.message || "Failed to send reset link"); }
    finally { setLoading(false); }
  }, [email, emailPrefix]);

  const stepIcon = () => {
    switch (step) {
      case "login": return <Lock className="h-5 w-5 text-primary" />;
      case "signup": return <Mail className="h-5 w-5 text-primary" />;
      case "forgot": return <KeyRound className="h-5 w-5 text-primary" />;
      case "verify": return <ShieldCheck className="h-5 w-5 text-primary" />;
    }
  };

  const stepTitle = () => {
    switch (step) {
      case "login": return "Welcome back";
      case "signup": return "Create Account";
      case "forgot": return "Reset Password";
      case "verify": return "Verifying Your Account";
    }
  };

  const stepDescription = () => {
    switch (step) {
      case "login": return "Sign in to continue";
      case "signup": return "Join Digi Mitra with your IIMB email";
      case "forgot": return "We'll send a reset link to your inbox";
      case "verify": return "Please wait while we verify your @iimb.ac.in email";
    }
  };

  const goBack = () => {
    setPassword(""); setConfirmPassword("");
    resetVerifySteps();
    setStep("login");
  };

  const emailPrefixInput = (id: string) => (
    <div className="flex items-center rounded-lg border border-border bg-card overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background">
      <Input
        id={id}
        type="text"
        placeholder="yourname"
        value={emailPrefix}
        onChange={(e) => setEmailPrefix(e.target.value.toLowerCase().trim())}
        className="border-0 rounded-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
        required
      />
      <span className="px-3 text-sm text-muted-foreground whitespace-nowrap border-l border-border bg-muted/50">
        @iimb.ac.in
      </span>
    </div>
  );

  const progressValue = verifySteps.filter((s) => s.status === "done").length / verifySteps.length * 100;

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 items-center justify-center bg-card relative overflow-hidden border-r border-border">
        <div className="relative z-10 text-center px-12">
          <DMLogo size={56} className="mx-auto mb-6" />
          <h2 className="text-3xl font-semibold text-foreground mb-1">Digi Mitra</h2>
          <p className="text-xs font-medium text-primary/70 mb-3 tracking-wide">An IIM Bangalore Student Platform</p>
          <p className="text-muted-foreground text-base leading-relaxed max-w-sm mx-auto">
            Anonymous, honest, student-driven.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8 bg-background">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <DMLogo size={40} className="mx-auto mb-3" />
            <h1 className="text-xl font-semibold text-foreground">Digi Mitra</h1>
            <p className="text-xs font-medium text-primary/60 mt-0.5">IIM Bangalore</p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <div className="mb-6">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">{stepIcon()}</div>
                <h2 className="text-lg font-semibold text-foreground">{stepTitle()}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{stepDescription()}</p>
              </div>

              {step === "login" && (
                <form onSubmit={(e) => { e.preventDefault(); loginWithPassword(); }} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs">Email</Label>
                    {emailPrefixInput("email")}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs">Password</Label>
                    <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-lg bg-card border-border" required />
                  </div>
                  <Button type="submit" className="w-full rounded-lg font-semibold" disabled={loading}>{loading ? "Signing in…" : "Sign In"}</Button>
                  <div className="flex items-center justify-between text-sm pt-1">
                    <button type="button" className="text-primary hover:underline font-medium text-xs" onClick={() => { setPassword(""); setConfirmPassword(""); setStep("signup"); }}>New here? Sign up</button>
                    <button type="button" className="text-muted-foreground hover:text-foreground text-xs" onClick={() => { setPassword(""); setStep("forgot"); }}>Forgot password?</button>
                  </div>
                </form>
              )}

              {step === "signup" && (
                <form onSubmit={(e) => { e.preventDefault(); signUpWithPassword(); }} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-email" className="text-xs">Email</Label>
                    {emailPrefixInput("signup-email")}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-password" className="text-xs">Password</Label>
                    <Input id="signup-password" type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-lg bg-card border-border" required minLength={6} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-confirm" className="text-xs">Confirm Password</Label>
                    <Input id="signup-confirm" type="password" placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="rounded-lg bg-card border-border" required minLength={6} />
                  </div>
                  <Button type="submit" className="w-full rounded-lg font-semibold" disabled={loading}>{loading ? "Creating account…" : "Create Account"}</Button>
                  <button type="button" className="w-full text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 pt-1" onClick={goBack}><ArrowLeft className="h-3 w-3" /> Back to Sign In</button>
                </form>
              )}

              {step === "verify" && (
                <div className="space-y-6">
                  <Progress value={progressValue} className="h-2" />

                  <div className="space-y-4">
                    {verifySteps.map((vs, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: vs.status === "pending" ? 0.4 : 1, x: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.3 }}
                        className="flex items-center gap-3"
                      >
                        {vs.status === "done" ? (
                          <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                        ) : vs.status === "active" ? (
                          <Loader2 className="h-5 w-5 text-primary shrink-0 animate-spin" />
                        ) : vs.status === "error" ? (
                          <div className="h-5 w-5 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
                            <span className="text-destructive text-xs font-bold">!</span>
                          </div>
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-muted shrink-0" />
                        )}
                        <span className={cn(
                          "text-sm",
                          vs.status === "done" && "text-foreground font-medium",
                          vs.status === "active" && "text-foreground",
                          vs.status === "error" && "text-destructive",
                          vs.status === "pending" && "text-muted-foreground"
                        )}>
                          {vs.label}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {verifyError && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      <p className="text-sm text-destructive text-center">{verifyError}</p>
                      <Button
                        className="w-full rounded-lg font-semibold"
                        onClick={runAutoVerify}
                      >
                        Retry Verification
                      </Button>
                    </motion.div>
                  )}

                  <button
                    type="button"
                    className="w-full text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1"
                    onClick={async () => {
                      await supabase.auth.signOut();
                      goBack();
                    }}
                  >
                    <ArrowLeft className="h-3 w-3" /> Sign out & go back
                  </button>
                </div>
              )}

              {step === "forgot" && (
                <form onSubmit={(e) => { e.preventDefault(); resetPassword(); }} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="forgot-email" className="text-xs">Email</Label>
                    {emailPrefixInput("forgot-email")}
                  </div>
                  <Button type="submit" className="w-full rounded-lg font-semibold" disabled={loading}>{loading ? "Sending…" : "Send Reset Link"}</Button>
                  <button type="button" className="w-full text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 pt-1" onClick={goBack}><ArrowLeft className="h-3 w-3" /> Back to Sign In</button>
                </form>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

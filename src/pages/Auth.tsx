import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Mail, Lock, KeyRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import DMLogo from "@/components/DMLogo";

type Step = "login" | "signup" | "forgot";

export default function Auth() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("login");
  const [loading, setLoading] = useState(false);
  const [emailPrefix, setEmailPrefix] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const email = `${emailPrefix}@iimb.ac.in`;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/");
    });
  }, [navigate]);

  const loginWithPassword = useCallback(async () => {
    if (!emailPrefix.trim() || !password) { toast.error("Please enter email and password"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Welcome back!");
      navigate("/");
    } catch (error: any) { toast.error(error.message || "Invalid credentials"); }
    finally { setLoading(false); }
  }, [email, emailPrefix, password, navigate]);

  const signUpWithPassword = useCallback(async () => {
    if (!emailPrefix.trim()) { toast.error("Please enter your email prefix"); return; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (password !== confirmPassword) { toast.error("Passwords don't match"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      toast.success("Account created! Welcome to Digi Mitra!");
      navigate("/");
    } catch (error: any) { toast.error(error.message || "Signup failed"); }
    finally { setLoading(false); }
  }, [email, emailPrefix, password, confirmPassword, navigate]);

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
    }
  };

  const stepTitle = () => {
    switch (step) {
      case "login": return "Welcome back";
      case "signup": return "Create Account";
      case "forgot": return "Reset Password";
    }
  };

  const stepDescription = () => {
    switch (step) {
      case "login": return "Sign in to continue";
      case "signup": return "Join Digi Mitra with your IIMB email";
      case "forgot": return "We'll send a reset link to your inbox";
    }
  };

  const goBack = () => {
    setPassword(""); setConfirmPassword("");
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

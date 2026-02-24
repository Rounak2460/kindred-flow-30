import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Mail, Lock, KeyRound, MailCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import DMLogo from "@/components/DMLogo";

type Step = "login" | "signup-email" | "verify-otp" | "set-password" | "forgot-otp";
type OtpMode = "signup" | "forgot";

export default function Auth() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("login");
  const [otpMode, setOtpMode] = useState<OtpMode>("signup");
  const [loading, setLoading] = useState(false);
  const [emailPrefix, setEmailPrefix] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const email = `${emailPrefix}@iimb.ac.in`;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/");
    });
  }, [navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const sendMagicLink = useCallback(async () => {
    if (!emailPrefix.trim()) { toast.error("Please enter your email prefix"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: otpMode === "signup" },
      });
      if (error) throw error;
      toast.success("Login link sent! Check your email.");
      setStep("verify-otp");
      setCooldown(60);
    } catch (error: any) { toast.error(error.message || "Failed to send link"); }
    finally { setLoading(false); }
  }, [email, emailPrefix, otpMode]);

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

  const setUserPassword = useCallback(async () => {
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (password !== confirmPassword) { toast.error("Passwords don't match"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success(otpMode === "signup" ? "Account created!" : "Password updated!");
      navigate("/");
    } catch (error: any) { toast.error(error.message || "Failed to set password"); }
    finally { setLoading(false); }
  }, [password, confirmPassword, otpMode, navigate]);

  const stepIcon = () => {
    switch (step) {
      case "login": return <Lock className="h-5 w-5 text-primary" />;
      case "signup-email": case "forgot-otp": return <Mail className="h-5 w-5 text-primary" />;
      case "verify-otp": return <MailCheck className="h-5 w-5 text-primary" />;
      case "set-password": return <KeyRound className="h-5 w-5 text-primary" />;
    }
  };

  const stepTitle = () => {
    switch (step) {
      case "login": return "Welcome back";
      case "signup-email": return "Create Account";
      case "forgot-otp": return "Reset Password";
      case "verify-otp": return "Check your inbox";
      case "set-password": return otpMode === "signup" ? "Set Your Password" : "New Password";
    }
  };

  const stepDescription = () => {
    switch (step) {
      case "login": return "Sign in to continue";
      case "signup-email": return "We'll send a login link to your inbox";
      case "forgot-otp": return "We'll send a reset link to your inbox";
      case "verify-otp": return `We sent a login link to ${email}`;
      case "set-password": return "Choose a strong password";
    }
  };

  const goBack = () => {
    setPassword(""); setConfirmPassword("");
    if (step === "verify-otp" || step === "set-password") { setStep(otpMode === "signup" ? "signup-email" : "forgot-otp"); }
    else { setStep("login"); }
  };

  const stepNumber = step === "signup-email" || step === "forgot-otp" ? 1 : step === "verify-otp" ? 2 : step === "set-password" ? 3 : 0;

  const EmailPrefixInput = ({ id }: { id: string }) => (
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

          {stepNumber > 0 && (
            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2, 3].map((s) => (
                <div key={s} className={cn("h-1 rounded-full transition-all duration-300", s === stepNumber ? "w-6 bg-primary" : s < stepNumber ? "w-1.5 bg-primary/50" : "w-1.5 bg-border")} />
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <div className="mb-6">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">{stepIcon()}</div>
                <h2 className="text-lg font-semibold text-foreground">{stepTitle()}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{stepDescription()}</p>
              </div>

              {step === "login" && (
                <div className="space-y-4">
                  <form onSubmit={(e) => { e.preventDefault(); loginWithPassword(); }} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs">Email</Label>
                      <EmailPrefixInput id="email" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-xs">Password</Label>
                      <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-lg bg-card border-border" required />
                    </div>
                    <Button type="submit" className="w-full rounded-lg font-semibold" disabled={loading}>{loading ? "Signing in…" : "Sign In"}</Button>
                    <div className="flex items-center justify-between text-sm pt-1">
                      <button type="button" className="text-primary hover:underline font-medium text-xs" onClick={() => { setOtpMode("signup"); setPassword(""); setStep("signup-email"); }}>New here? Sign up</button>
                      <button type="button" className="text-muted-foreground hover:text-foreground text-xs" onClick={() => { setOtpMode("forgot"); setPassword(""); setStep("forgot-otp"); }}>Forgot password?</button>
                    </div>
                  </form>
                </div>
              )}

              {(step === "signup-email" || step === "forgot-otp") && (
                <div className="space-y-4">
                  <form onSubmit={(e) => { e.preventDefault(); sendMagicLink(); }} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs">Email</Label>
                      <EmailPrefixInput id="email" />
                    </div>
                    <Button type="submit" className="w-full rounded-lg font-semibold" disabled={loading}>{loading ? "Sending…" : "Send Link"}</Button>
                    <button type="button" className="w-full text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 pt-1" onClick={goBack}><ArrowLeft className="h-3 w-3" /> Back to Sign In</button>
                  </form>
                </div>
              )}

              {step === "verify-otp" && (
                <div className="space-y-5">
                  <div className="flex flex-col items-center text-center py-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <MailCheck className="h-8 w-8 text-primary animate-pulse" />
                    </div>
                    <p className="text-sm text-foreground font-medium">Click the link in the email to continue</p>
                    <p className="text-xs text-muted-foreground mt-1.5">Check your spam folder if you don't see it</p>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <button type="button" className="text-muted-foreground hover:text-foreground flex items-center gap-1" onClick={goBack}><ArrowLeft className="h-3 w-3" /> Back</button>
                    <button type="button" className="text-primary font-medium hover:underline disabled:opacity-50" disabled={cooldown > 0} onClick={sendMagicLink}>{cooldown > 0 ? `Resend in ${cooldown}s` : "Resend link"}</button>
                  </div>
                </div>
              )}

              {step === "set-password" && (
                <form onSubmit={(e) => { e.preventDefault(); setUserPassword(); }} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="new-password" className="text-xs">Password</Label>
                    <Input id="new-password" type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-lg bg-card border-border" required minLength={6} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confirm-password" className="text-xs">Confirm Password</Label>
                    <Input id="confirm-password" type="password" placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="rounded-lg bg-card border-border" required minLength={6} />
                  </div>
                  <Button type="submit" className="w-full rounded-lg font-semibold" disabled={loading}>{loading ? "Setting…" : otpMode === "signup" ? "Create Account" : "Reset Password"}</Button>
                  <button type="button" className="w-full text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1" onClick={goBack}><ArrowLeft className="h-3 w-3" /> Back</button>
                </form>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

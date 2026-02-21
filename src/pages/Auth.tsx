import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { ArrowLeft, Mail, ShieldCheck, Lock, KeyRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import dmLogo from "@/assets/digitalmitra-logo.png";

type Step = "login" | "signup-email" | "verify-otp" | "set-password" | "forgot-otp";
type OtpMode = "signup" | "forgot";

const isValidEmail = (email: string) =>
  email.endsWith("@iimb.ac.in") || email.endsWith("@gmail.com");

export default function Auth() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("login");
  const [otpMode, setOtpMode] = useState<OtpMode>("signup");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);

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

  const sendOtp = useCallback(async () => {
    if (!isValidEmail(email)) { toast.error("Please use your @iimb.ac.in email address"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: otpMode === "signup" } });
      if (error) throw error;
      toast.success("OTP sent! Check your email for a 6-digit code.");
      setStep("verify-otp");
      setCooldown(60);
    } catch (error: any) { toast.error(error.message || "Failed to send OTP"); }
    finally { setLoading(false); }
  }, [email, otpMode]);

  const verifyOtp = useCallback(async () => {
    if (otp.length !== 6) { toast.error("Please enter the 6-digit code"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" });
      if (error) throw error;
      toast.success("Verified!");
      setStep("set-password");
    } catch (error: any) { toast.error(error.message || "Invalid or expired code"); }
    finally { setLoading(false); }
  }, [email, otp]);

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

  const loginWithPassword = useCallback(async () => {
    if (!email || !password) { toast.error("Please enter email and password"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Welcome back!");
      navigate("/");
    } catch (error: any) { toast.error(error.message || "Invalid credentials"); }
    finally { setLoading(false); }
  }, [email, password, navigate]);

  const stepIcon = () => {
    switch (step) {
      case "login": return <Lock className="h-5 w-5 text-primary" />;
      case "signup-email": case "forgot-otp": return <Mail className="h-5 w-5 text-primary" />;
      case "verify-otp": return <ShieldCheck className="h-5 w-5 text-primary" />;
      case "set-password": return <KeyRound className="h-5 w-5 text-primary" />;
    }
  };

  const stepTitle = () => {
    switch (step) {
      case "login": return "Welcome back";
      case "signup-email": return "Create Account";
      case "forgot-otp": return "Reset Password";
      case "verify-otp": return "Check your email";
      case "set-password": return otpMode === "signup" ? "Set Your Password" : "New Password";
    }
  };

  const stepDescription = () => {
    switch (step) {
      case "login": return "Sign in to continue";
      case "signup-email": return "We'll send a 6-digit code to verify";
      case "forgot-otp": return "We'll send a reset code to your email";
      case "verify-otp": return `Enter the code sent to ${email}`;
      case "set-password": return "Choose a strong password";
    }
  };

  const goBack = () => {
    setOtp(""); setPassword(""); setConfirmPassword("");
    if (step === "verify-otp" || step === "set-password") { setStep(otpMode === "signup" ? "signup-email" : "forgot-otp"); }
    else { setStep("login"); }
  };

  const stepNumber = step === "signup-email" || step === "forgot-otp" ? 1 : step === "verify-otp" ? 2 : step === "set-password" ? 3 : 0;

  return (
    <div className="min-h-screen flex">
      {/* Left panel - brand (desktop only) */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-card relative overflow-hidden border-r border-border">
        {/* Subtle red accent line */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
        <div className="relative z-10 text-center px-12">
          <img src={dmLogo} alt="Digital Mitra" className="h-16 w-16 rounded-2xl mx-auto mb-6" />
          <h2 className="font-serif text-4xl text-foreground mb-3">Digital Mitra</h2>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-sm mx-auto">
            The knowledge layer of IIM Bangalore. Anonymous, honest, student-driven.
          </p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 bg-background">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <img src={dmLogo} alt="Digital Mitra" className="h-12 w-12 rounded-xl mx-auto mb-3" />
            <h1 className="font-serif text-2xl text-foreground">Digital Mitra</h1>
            <p className="text-muted-foreground text-sm mt-1">The Knowledge Layer of IIM Bangalore</p>
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
                <h2 className="font-serif text-xl text-foreground">{stepTitle()}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{stepDescription()}</p>
              </div>

              {step === "login" && (
                <form onSubmit={(e) => { e.preventDefault(); loginWithPassword(); }} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs">Email</Label>
                    <Input id="email" type="email" placeholder="yourname@iimb.ac.in" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-lg bg-card border-border" required />
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
              )}

              {(step === "signup-email" || step === "forgot-otp") && (
                <form onSubmit={(e) => { e.preventDefault(); sendOtp(); }} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs">IIMB Email</Label>
                    <Input id="email" type="email" placeholder="yourname@iimb.ac.in" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-lg bg-card border-border" required />
                  </div>
                  <Button type="submit" className="w-full rounded-lg font-semibold" disabled={loading}>{loading ? "Sending…" : "Send OTP"}</Button>
                  <p className="text-center text-[11px] text-muted-foreground">Only @iimb.ac.in emails accepted</p>
                  <button type="button" className="w-full text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 pt-1" onClick={goBack}><ArrowLeft className="h-3 w-3" /> Back to Sign In</button>
                </form>
              )}

              {step === "verify-otp" && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                      <InputOTPGroup>
                        {[0, 1, 2, 3, 4, 5].map((i) => (<InputOTPSlot key={i} index={i} />))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <Button className="w-full rounded-lg font-semibold" disabled={loading || otp.length !== 6} onClick={verifyOtp}>{loading ? "Verifying…" : "Verify Code"}</Button>
                  <div className="flex items-center justify-between text-xs">
                    <button type="button" className="text-muted-foreground hover:text-foreground flex items-center gap-1" onClick={goBack}><ArrowLeft className="h-3 w-3" /> Back</button>
                    <button type="button" className="text-primary font-medium hover:underline disabled:opacity-50" disabled={cooldown > 0} onClick={sendOtp}>{cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}</button>
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

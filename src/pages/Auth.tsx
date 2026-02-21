import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { ArrowLeft, Mail, ShieldCheck, Lock, KeyRound } from "lucide-react";

type Step = "login" | "signup-email" | "verify-otp" | "set-password" | "forgot-otp";
type OtpMode = "signup" | "forgot";

const isValidEmail = (email: string) =>
  email.endsWith("@iimb.ac.in") || email.endsWith("@gmail.com"); // gmail is temp bypass

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

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const sendOtp = useCallback(async () => {
    if (!isValidEmail(email)) {
      toast.error("Please use your @iimb.ac.in email address");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: otpMode === "signup" },
      });
      if (error) throw error;
      toast.success("OTP sent! Check your email for a 6-digit code.");
      setStep("verify-otp");
      setCooldown(60);
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }, [email, otpMode]);

  const verifyOtp = useCallback(async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });
      if (error) throw error;
      toast.success("Verified!");
      setStep("set-password");
    } catch (error: any) {
      toast.error(error.message || "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  }, [email, otp]);

  const setUserPassword = useCallback(async () => {
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success(otpMode === "signup" ? "Account created!" : "Password updated!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to set password");
    } finally {
      setLoading(false);
    }
  }, [password, confirmPassword, otpMode, navigate]);

  const loginWithPassword = useCallback(async () => {
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Welcome back!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }, [email, password, navigate]);

  const stepIcon = () => {
    switch (step) {
      case "login": return <Lock className="h-6 w-6 text-primary" />;
      case "signup-email":
      case "forgot-otp": return <Mail className="h-6 w-6 text-primary" />;
      case "verify-otp": return <ShieldCheck className="h-6 w-6 text-primary" />;
      case "set-password": return <KeyRound className="h-6 w-6 text-primary" />;
    }
  };

  const stepTitle = () => {
    switch (step) {
      case "login": return "Sign In";
      case "signup-email": return "Create Account";
      case "forgot-otp": return "Reset Password";
      case "verify-otp": return "Verify Email";
      case "set-password": return otpMode === "signup" ? "Set Your Password" : "Reset Your Password";
    }
  };

  const stepDescription = () => {
    switch (step) {
      case "login": return "Enter your credentials to continue";
      case "signup-email": return "We'll send a 6-digit code to verify your email";
      case "forgot-otp": return "We'll send a 6-digit code to reset your password";
      case "verify-otp": return `Enter the 6-digit code sent to ${email}`;
      case "set-password": return "Choose a strong password for your account";
    }
  };

  const goBack = () => {
    setOtp("");
    setPassword("");
    setConfirmPassword("");
    if (step === "verify-otp" || step === "set-password") {
      setStep(otpMode === "signup" ? "signup-email" : "forgot-otp");
    } else {
      setStep("login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md fade-up">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight">
            <span className="text-primary">D</span>igital Mitra
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            The Knowledge Layer of IIM Bangalore
          </p>
        </div>

        <Card className="shadow-elevated border-border/50">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              {stepIcon()}
            </div>
            <CardTitle className="text-xl font-display">{stepTitle()}</CardTitle>
            <CardDescription>{stepDescription()}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* LOGIN STEP */}
            {step === "login" && (
              <form
                onSubmit={(e) => { e.preventDefault(); loginWithPassword(); }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="yourname@iimb.ac.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full rounded-xl" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    className="text-primary hover:underline font-medium"
                    onClick={() => {
                      setOtpMode("signup");
                      setPassword("");
                      setStep("signup-email");
                    }}
                  >
                    New here? Sign up
                  </button>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setOtpMode("forgot");
                      setPassword("");
                      setStep("forgot-otp");
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
              </form>
            )}

            {/* SIGNUP EMAIL / FORGOT OTP STEP */}
            {(step === "signup-email" || step === "forgot-otp") && (
              <form
                onSubmit={(e) => { e.preventDefault(); sendOtp(); }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="email">IIMB Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="yourname@iimb.ac.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full rounded-xl" disabled={loading}>
                  {loading ? "Sending code..." : "Send OTP"}
                </Button>
                <p className="text-center text-[11px] text-muted-foreground">
                  Only @iimb.ac.in email addresses are accepted
                </p>
                <button
                  type="button"
                  className="w-full text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1"
                  onClick={goBack}
                >
                  <ArrowLeft className="h-3 w-3" /> Back to Sign In
                </button>
              </form>
            )}

            {/* VERIFY OTP STEP */}
            {step === "verify-otp" && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <Button
                  className="w-full rounded-xl"
                  disabled={loading || otp.length !== 6}
                  onClick={verifyOtp}
                >
                  {loading ? "Verifying..." : "Verify Code"}
                </Button>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                    onClick={goBack}
                  >
                    <ArrowLeft className="h-3 w-3" /> Back
                  </button>
                  <button
                    type="button"
                    className="text-sm text-primary font-medium hover:underline disabled:opacity-50 disabled:no-underline"
                    disabled={cooldown > 0}
                    onClick={sendOtp}
                  >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                  </button>
                </div>
              </div>
            )}

            {/* SET PASSWORD STEP */}
            {step === "set-password" && (
              <form
                onSubmit={(e) => { e.preventDefault(); setUserPassword(); }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="new-password">Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full rounded-xl" disabled={loading}>
                  {loading ? "Setting password..." : otpMode === "signup" ? "Create Account" : "Reset Password"}
                </Button>
                <button
                  type="button"
                  className="w-full text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1"
                  onClick={goBack}
                >
                  <ArrowLeft className="h-3 w-3" /> Back
                </button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

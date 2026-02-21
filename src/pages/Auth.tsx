import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";

const isValidEmail = (email: string) =>
  email.endsWith("@iimb.ac.in") || email.endsWith("@gmail.com"); // gmail is temp bypass

export default function Auth() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
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
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      toast.success("Check your email for a one-time login link!");
      setStep("otp");
      setCooldown(60);
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }, [email]);


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
              {step === "email" ? (
                <Mail className="h-6 w-6 text-primary" />
              ) : (
                <ShieldCheck className="h-6 w-6 text-primary" />
              )}
            </div>
            <CardTitle className="text-xl font-display">
              {step === "email" ? "Sign in to Digital Mitra" : "Check your email"}
            </CardTitle>
            <CardDescription>
              {step === "email"
                ? "Use your @iimb.ac.in email to get started"
                : `We sent a one-time login link to ${email}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "email" ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendOtp();
                }}
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
                  {loading ? "Sending link..." : "Send Login Link"}
                </Button>
                <p className="text-center text-[11px] text-muted-foreground">
                  Only @iimb.ac.in email addresses are accepted
                </p>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-3 text-center">
                  <p className="text-sm text-muted-foreground">
                    Click the link in the email we sent to <span className="font-medium text-foreground">{email}</span> to sign in.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Don't see it? Check your spam folder.
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                    onClick={() => {
                      setStep("email");
                    }}
                  >
                    <ArrowLeft className="h-3 w-3" /> Change email
                  </button>
                  <button
                    type="button"
                    className="text-sm text-primary font-medium hover:underline disabled:opacity-50 disabled:no-underline"
                    disabled={cooldown > 0}
                    onClick={sendOtp}
                  >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend link"}
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

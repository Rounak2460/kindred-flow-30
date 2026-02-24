import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

interface AuthGuardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action?: string;
}

export default function AuthGuardDialog({ open, onOpenChange, action = "do that" }: AuthGuardDialogProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader className="text-center items-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-lg font-semibold">Join Digi Mitra</DialogTitle>
          <DialogDescription className="text-sm">
            Sign in with your @iimb.ac.in email to {action}. Only IIMB students can participate.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 mt-2">
          <Button className="w-full rounded-lg font-semibold" onClick={() => { onOpenChange(false); navigate("/auth"); }}>
            Sign In with Email
          </Button>
        </div>
        <p className="text-center text-[11px] text-muted-foreground mt-1">Only @iimb.ac.in emails accepted</p>
      </DialogContent>
    </Dialog>
  );
}

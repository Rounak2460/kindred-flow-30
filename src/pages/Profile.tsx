import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { generateAnonHandle } from "@/lib/anonymity";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Award, Star, Eye, Pencil, X, Check } from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, loading, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", batch: "", section: "", bio: "" });

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || "",
        batch: profile.batch || "",
        section: profile.section || "",
        bio: (profile as any).bio || "",
      });
    }
  }, [profile]);

  if (loading || !user || !profile) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const anonHandle = generateAnonHandle(user.id);
  const initials = profile.name
    ? profile.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        name: form.name,
        batch: form.batch,
        section: form.section,
        bio: form.bio,
      })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to update profile");
    } else {
      await refreshProfile();
      toast.success("Profile updated!");
      setEditing(false);
    }
    setSaving(false);
  };

  const bio = (profile as any).bio || "";

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl text-foreground">Profile</h1>
        <div className="flex items-center gap-2">
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={handleLogout}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Profile card */}
      <div className="bg-card/60 border border-border/40 rounded-2xl overflow-hidden">
        {/* Gradient header */}
        <div className="h-20 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
        <div className="px-5 pb-6 -mt-10">
          <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
            <AvatarFallback className="text-xl font-bold bg-secondary text-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="mt-3">
            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Name</label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    className="bg-secondary/40"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Bio</label>
                  <Textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value.slice(0, 160) })}
                    placeholder="Write a short bio..."
                    className="bg-secondary/40 min-h-[60px] resize-none"
                    rows={2}
                  />
                  <p className="text-[10px] text-muted-foreground mt-1 text-right">{form.bio.length}/160</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Batch</label>
                    <Input
                      value={form.batch}
                      onChange={(e) => setForm({ ...form, batch: e.target.value })}
                      placeholder="e.g. PGP 2025"
                      className="bg-secondary/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Section</label>
                    <Input
                      value={form.section}
                      onChange={(e) => setForm({ ...form, section: e.target.value })}
                      placeholder="e.g. A"
                      className="bg-secondary/40"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button onClick={handleSave} disabled={saving} size="sm" className="gap-1">
                    <Check className="h-3 w-3" /> {saving ? "Saving..." : "Save"}
                  </Button>
                  <Button onClick={() => setEditing(false)} variant="ghost" size="sm" className="gap-1">
                    <X className="h-3 w-3" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-foreground">{profile.name || "Anonymous"}</h2>
                <p className="text-sm text-muted-foreground">{anonHandle}</p>
                {bio && <p className="text-sm text-foreground/80 mt-2">{bio}</p>}
                {profile.founding_contributor && (
                  <Badge variant="secondary" className="mt-2 gap-1 bg-primary/10 text-primary border-primary/20">
                    <Award className="h-3 w-3" /> Founding Contributor
                  </Badge>
                )}
              </>
            )}
          </div>

          {/* Stats */}
          {!editing && (
            <>
              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="bg-secondary/40 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <Star className="h-4 w-4 text-primary" />
                    <p className="text-lg font-bold text-foreground tabular-nums">{profile.credits}</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Credits</p>
                </div>
                <div className="bg-secondary/40 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-foreground mb-0.5">{profile.batch || "—"}</p>
                  <p className="text-[11px] text-muted-foreground">Batch</p>
                </div>
                <div className="bg-secondary/40 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <p className="text-lg font-bold text-foreground tabular-nums">{Math.max(0, 5 - profile.free_views_used)}</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Free Views</p>
                </div>
              </div>

              {profile.section && (
                <div className="mt-4 py-3 border-t border-border/30">
                  <p className="text-xs text-muted-foreground">Section: <span className="text-foreground font-medium">{profile.section}</span></p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

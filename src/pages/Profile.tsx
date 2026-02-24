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
import { LogOut, Award, Pencil, X, Check, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import PostCard from "@/components/feed/PostCard";
import ThemeToggle from "@/components/ThemeToggle";
import { useQuery } from "@tanstack/react-query";

type Tab = "posts" | "saved" | "settings";

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, loading, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("posts");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", batch: "", section: "", bio: "" });

  useEffect(() => { if (!loading && !user) navigate("/auth"); }, [loading, user, navigate]);
  useEffect(() => {
    if (profile) { setForm({ name: profile.name || "", batch: profile.batch || "", section: profile.section || "", bio: profile.bio || "" }); }
  }, [profile]);

  // Fetch user's posts
  const { data: userPosts = [] } = useQuery({
    queryKey: ["user-posts", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("posts").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch bookmarks
  const { data: bookmarks = [] } = useQuery({
    queryKey: ["bookmarks", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: bms } = await supabase.from("bookmarks").select("content_id, content_type").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
      if (!bms || bms.length === 0) return [];
      const postIds = bms.filter((b) => b.content_type === "post").map((b) => b.content_id);
      if (postIds.length === 0) return [];
      const { data: posts } = await supabase.from("posts").select("*").in("id", postIds);
      return posts || [];
    },
    enabled: !!user && activeTab === "saved",
  });

  if (loading || !user || !profile) {
    return <div className="flex justify-center py-20"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  }

  const anonHandle = generateAnonHandle(user.id);
  const initials = profile.name ? profile.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "??";

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/"); };
  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ name: form.name, batch: form.batch, section: form.section, bio: form.bio }).eq("user_id", user.id);
    if (error) { toast.error("Failed to update profile"); } else { await refreshProfile(); toast.success("Profile updated!"); setEditing(false); }
    setSaving(false);
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "posts", label: "Posts" },
    { key: "saved", label: "Saved" },
    { key: "settings", label: "Settings" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Profile header */}
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="h-14 w-14 border-2 border-border">
          <AvatarFallback className="text-lg font-semibold bg-muted text-foreground">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-foreground truncate">{profile.name || "Anonymous"}</h2>
          <p className="text-xs text-muted-foreground">{anonHandle}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">{profile.credits} credits</span>
            {profile.founding_contributor && <Badge variant="secondary" className="text-[10px] gap-1 bg-primary/10 text-primary border-primary/20 py-0"><Award className="h-2.5 w-2.5" /> Founder</Badge>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === t.key ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Posts tab */}
      {activeTab === "posts" && (
        <div>
          {userPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">No posts yet</p>
              <Button size="sm" className="mt-3 rounded-lg" onClick={() => navigate("/submit")}>Create your first post</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {userPosts.map((post: any) => (
                <PostCard key={post.id} {...post} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Saved tab */}
      {activeTab === "saved" && (
        <div>
          {bookmarks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">No saved posts yet</p>
              <p className="text-xs text-muted-foreground mt-1">Bookmark posts from the feed to see them here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarks.map((post: any) => (
                <PostCard key={post.id} {...post} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Settings tab */}
      {activeTab === "settings" && (
        <div className="space-y-4">
          {/* Edit profile */}
          <div className="bg-card border border-border/50 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-foreground">Edit Profile</h3>
              {!editing && <button onClick={() => setEditing(true)} className="text-xs text-primary hover:underline">Edit</button>}
            </div>
            {editing ? (
              <div className="space-y-3">
                <div><label className="text-xs text-muted-foreground mb-1 block">Name</label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" className="bg-background" /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">Bio</label><Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value.slice(0, 160) })} placeholder="Write a short bio..." className="bg-background min-h-[60px] resize-none" rows={2} /><p className="text-[10px] text-muted-foreground mt-1 text-right">{form.bio.length}/160</p></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-muted-foreground mb-1 block">Batch</label><Input value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })} placeholder="e.g. PGP 2025" className="bg-background" /></div>
                  <div><label className="text-xs text-muted-foreground mb-1 block">Section</label><Input value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} placeholder="e.g. A" className="bg-background" /></div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button onClick={handleSave} disabled={saving} size="sm" className="gap-1 rounded-lg"><Check className="h-3 w-3" /> {saving ? "Saving..." : "Save"}</Button>
                  <Button onClick={() => setEditing(false)} variant="ghost" size="sm" className="gap-1 rounded-lg"><X className="h-3 w-3" /> Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">Name: <span className="text-foreground">{profile.name || "—"}</span></p>
                <p className="text-muted-foreground">Batch: <span className="text-foreground">{profile.batch || "—"}</span></p>
                <p className="text-muted-foreground">Section: <span className="text-foreground">{profile.section || "—"}</span></p>
                {profile.bio && <p className="text-muted-foreground">Bio: <span className="text-foreground">{profile.bio}</span></p>}
              </div>
            )}
          </div>

          {/* Theme */}
          <div className="bg-card border border-border/50 rounded-xl p-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-foreground">Theme</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Switch between light and dark mode</p>
            </div>
            <ThemeToggle />
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 bg-card border border-border/50 rounded-xl p-5 text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

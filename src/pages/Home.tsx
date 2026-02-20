import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, FileText, Globe, Briefcase, ArrowRight, Star, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } },
};

interface Stats {
  courses: number;
  exchanges: number;
  internships: number;
  papers: number;
}

export default function Home() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({ courses: 0, exchanges: 0, internships: 0, papers: 0 });
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));

    // Fetch stats
    Promise.all([
      supabase.from("course_reviews").select("id", { count: "exact", head: true }),
      supabase.from("exchange_reviews").select("id", { count: "exact", head: true }),
      supabase.from("internship_reviews").select("id", { count: "exact", head: true }),
      supabase.from("exam_papers").select("id", { count: "exact", head: true }),
    ]).then(([courses, exchanges, internships, papers]) => {
      setStats({
        courses: courses.count ?? 0,
        exchanges: exchanges.count ?? 0,
        internships: internships.count ?? 0,
        papers: papers.count ?? 0,
      });
    });
  }, []);

  const quickLinks = [
    {
      title: "Academics",
      description: "Course reviews, ratings & professor insights",
      icon: BookOpen,
      path: "/academics",
      gradient: "from-primary/10 to-primary/5",
    },
    {
      title: "Exchange",
      description: "Exchange diaries from students across the globe",
      icon: Globe,
      path: "/exchange",
      gradient: "from-blue-500/10 to-blue-500/5",
    },
    {
      title: "Internships",
      description: "Company reviews, stipends & interview tips",
      icon: Briefcase,
      path: "/internships",
      gradient: "from-amber-500/10 to-amber-500/5",
    },
  ];

  const statCards = [
    { label: "Course Reviews", count: stats.courses, icon: Star },
    { label: "Exchange Diaries", count: stats.exchanges, icon: Globe },
    { label: "Internship Reports", count: stats.internships, icon: TrendingUp },
    { label: "Exam Papers", count: stats.papers, icon: FileText },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 pt-20 pb-16 md:pt-28 md:pb-24">
          <motion.div variants={item} className="max-w-2xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
              The Knowledge Layer of{" "}
              <span className="text-primary">IIM Bangalore</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Course reviews, exam papers, exchange diaries, and internship intel — by students, for students.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              {user ? (
                <Button size="lg" className="rounded-full px-8" onClick={() => navigate("/academics")}>
                  Explore Courses
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <>
                  <Button size="lg" className="rounded-full px-8" onClick={() => navigate("/auth?tab=signup")}>
                    Get Started
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-full px-8" onClick={() => navigate("/auth")}>
                    Sign in
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </div>
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl -z-10" />
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4">
        <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.label} className="border-border/50 shadow-soft card-hover">
              <CardContent className="p-5 flex flex-col items-center text-center gap-2">
                <stat.icon className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold font-display">{stat.count}</span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </section>

      {/* Quick Access */}
      <section className="container mx-auto px-4 mt-16">
        <motion.div variants={item}>
          <h2 className="font-display text-2xl font-bold mb-6">Explore</h2>
        </motion.div>
        <motion.div variants={item} className="grid md:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Link key={link.path} to={link.path}>
              <Card className={`border-border/50 shadow-soft card-hover bg-gradient-to-br ${link.gradient} group cursor-pointer`}>
                <CardContent className="p-6 flex flex-col gap-3">
                  <link.icon className="h-6 w-6 text-foreground" />
                  <div>
                    <h3 className="font-display text-lg font-semibold">{link.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{link.description}</p>
                  </div>
                  <div className="flex items-center text-sm text-primary font-medium mt-2 group-hover:gap-2 transition-all">
                    Browse <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </motion.div>
      </section>

      {/* CTA for non-logged-in users */}
      {!user && (
        <section className="container mx-auto px-4 mt-16">
          <motion.div variants={item}>
            <Card className="border-border/50 shadow-elevated bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-8 md:p-12 text-center">
                <Users className="h-8 w-8 text-primary mx-auto mb-4" />
                <h2 className="font-display text-2xl font-bold mb-2">
                  Built by IIMB, for IIMB
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  Join your batchmates in building the most comprehensive knowledge base for IIM Bangalore students.
                </p>
                <Button size="lg" className="rounded-full px-8" onClick={() => navigate("/auth?tab=signup")}>
                  Join with your IIMB email
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </section>
      )}
    </motion.div>
  );
}

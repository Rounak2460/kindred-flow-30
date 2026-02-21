import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Briefcase } from "lucide-react";
import FilterPills from "@/components/shared/FilterPills";
import StarRating from "@/components/shared/StarRating";
import { useInternshipCompanies } from "@/hooks/useInternshipCompanies";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const DOMAIN_OPTIONS = [
  { value: "all", label: "All" },
  { value: "consulting", label: "Consulting" },
  { value: "finance", label: "Finance" },
  { value: "pm", label: "Product Mgmt" },
  { value: "strategy_ops", label: "Strategy & Ops" },
  { value: "marketing", label: "Marketing" },
  { value: "tech", label: "Tech" },
  { value: "gm", label: "General Mgmt" },
];

export default function Internships() {
  const navigate = useNavigate();
  const [domain, setDomain] = useState("all");
  const { data: companies = [], isLoading } = useInternshipCompanies(domain);

  return (
    <div className="max-w-3xl mx-auto px-4 py-4">
      <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>
      <div className="mb-6">
        <h1 className="text-xl font-bold flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary" /> Internship Intel</h1>
        <p className="text-xs text-muted-foreground mt-1">Real internship reviews from your batchmates</p>
      </div>
      <div className="mb-5">
        <FilterPills options={DOMAIN_OPTIONS} selected={domain} onSelect={setDomain} />
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-36 rounded-xl" />)}</div>
      ) : companies.length === 0 ? (
        <div className="text-center py-20 bg-card/50 border border-border/40 rounded-xl"><p className="text-sm font-medium">No companies found</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {companies.map(c => (
            <button key={c.id} onClick={() => navigate(`/internships/${c.id}`)} className="text-left rounded-xl border border-border bg-card p-4 hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {c.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{c.name}</h3>
                  <p className="text-[10px] text-muted-foreground capitalize">{c.domain.replace("_", " ")} · {c.avg_stipend || "—"}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <StarRating rating={Number(c.avg_rating)} />
                <span className="text-[10px] text-muted-foreground">{c.review_count} review{c.review_count !== 1 ? "s" : ""}</span>
              </div>
              {c.highlights.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {c.highlights.slice(0, 3).map(h => <Badge key={h} variant="secondary" className="text-[10px]">{h}</Badge>)}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

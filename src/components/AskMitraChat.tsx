import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Square, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAskMitra } from "@/hooks/useAskMitra";

function MarkdownLite({ content }: { content: string }) {
  // Simple markdown rendering: bold, italic, code, headers, lists
  const lines = content.split("\n");
  return (
    <div className="text-sm leading-relaxed space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith("### ")) return <h4 key={i} className="font-semibold text-xs mt-2">{line.slice(4)}</h4>;
        if (line.startsWith("## ")) return <h3 key={i} className="font-semibold text-sm mt-2">{line.slice(3)}</h3>;
        if (line.startsWith("# ")) return <h2 key={i} className="font-bold text-sm mt-2">{line.slice(2)}</h2>;
        if (line.startsWith("- ") || line.startsWith("* ")) return <p key={i} className="pl-3">• {renderInline(line.slice(2))}</p>;
        if (/^\d+\.\s/.test(line)) return <p key={i} className="pl-3">{renderInline(line)}</p>;
        if (line.trim() === "") return <br key={i} />;
        return <p key={i}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

function renderInline(text: string) {
  // Handle **bold**, *italic*, `code`
  const parts: (string | JSX.Element)[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Code
    const codeMatch = remaining.match(/`(.+?)`/);

    let firstMatch: { index: number; length: number; element: JSX.Element; full: string } | null = null;

    if (boldMatch && boldMatch.index !== undefined) {
      const candidate = { index: boldMatch.index, length: boldMatch[0].length, element: <strong key={key++}>{boldMatch[1]}</strong>, full: boldMatch[0] };
      if (!firstMatch || candidate.index < firstMatch.index) firstMatch = candidate;
    }
    if (codeMatch && codeMatch.index !== undefined) {
      const candidate = { index: codeMatch.index, length: codeMatch[0].length, element: <code key={key++} className="bg-muted px-1 py-0.5 rounded text-xs">{codeMatch[1]}</code>, full: codeMatch[0] };
      if (!firstMatch || candidate.index < firstMatch.index) firstMatch = candidate;
    }

    if (firstMatch) {
      if (firstMatch.index > 0) parts.push(remaining.slice(0, firstMatch.index));
      parts.push(firstMatch.element);
      remaining = remaining.slice(firstMatch.index + firstMatch.length);
    } else {
      parts.push(remaining);
      break;
    }
  }

  return <>{parts}</>;
}

const SUGGESTIONS = [
  "What are the easiest courses in T4?",
  "Best courses for placements?",
  "Compare Corporate Strategy vs Valuation",
  "Which T4 courses have no exams?",
];

export default function AskMitraChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, isLoading, error, send, stop, clear } = useAskMitra();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;
    send(input.trim());
    setInput("");
  };

  const handleSuggestion = (s: string) => {
    send(s);
  };

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50 h-14 w-14 rounded-2xl bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
          aria-label="Ask Mitra Ronnie"
        >
          <Sparkles className="h-6 w-6" />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed inset-x-0 bottom-0 md:inset-auto md:bottom-8 md:right-8 md:w-[400px] z-50 flex flex-col bg-card border border-border rounded-t-2xl md:rounded-2xl shadow-xl max-h-[85vh] md:max-h-[600px]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">Ask Mitra Ronnie</p>
                <p className="text-[10px] text-muted-foreground">AI powered by platform data</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clear} title="Clear chat">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
            {messages.length === 0 && !isLoading && (
              <div className="text-center py-6">
                <Sparkles className="h-8 w-8 text-primary/30 mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground mb-1">Hey! I'm Mitra Ronnie 👋</p>
                <p className="text-xs text-muted-foreground mb-4">Ask me anything about IIMB courses, campus life, placements, or exchange programs.</p>
                <div className="space-y-2">
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => handleSuggestion(s)}
                      className="block w-full text-left text-xs px-3 py-2 rounded-lg border border-border hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-xl px-3 py-2 ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-foreground"
                }`}>
                  {m.role === "user" ? (
                    <p className="text-sm">{m.content}</p>
                  ) : (
                    <MarkdownLite content={m.content} />
                  )}
                </div>
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex justify-start">
                <div className="bg-muted/50 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="text-center">
                <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2 inline-block">{error}</p>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-border">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about courses, campus, placements..."
                className="flex-1 h-9 px-3 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                disabled={isLoading}
              />
              {isLoading ? (
                <Button type="button" size="icon" variant="outline" className="h-9 w-9 rounded-lg" onClick={stop}>
                  <Square className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button type="submit" size="icon" className="h-9 w-9 rounded-lg" disabled={!input.trim()}>
                  <Send className="h-3.5 w-3.5" />
                </Button>
              )}
            </form>
            <p className="text-[9px] text-muted-foreground text-center mt-1.5">Powered by Digi Mitra AI · Answers based on platform data only</p>
          </div>
        </div>
      )}
    </>
  );
}

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useTypingIndicator(conversationId: string | undefined, userId: string | undefined) {
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!conversationId || !userId) return;

    const channel = supabase.channel(`typing:${conversationId}`, {
      config: { presence: { key: userId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        // Check if any OTHER user has typing=true
        const othersTyping = Object.entries(state).some(
          ([key, presences]) =>
            key !== userId &&
            (presences as any[]).some((p) => p.typing === true)
        );
        setIsOtherTyping(othersTyping);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ typing: false });
        }
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
    };
  }, [conversationId, userId]);

  const setTyping = useCallback(
    (isTyping: boolean) => {
      const channel = channelRef.current;
      if (!channel) return;

      if (isTyping) {
        channel.track({ typing: true });
        // Auto-stop after 3s of no further calls
        if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
        stopTimeoutRef.current = setTimeout(() => {
          channel.track({ typing: false });
        }, 3000);
      } else {
        if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
        channel.track({ typing: false });
      }
    },
    []
  );

  return { isOtherTyping, setTyping };
}

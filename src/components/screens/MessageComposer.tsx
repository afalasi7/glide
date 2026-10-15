"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { GlassButton } from "@/components/ui/glass";

export function MessageComposer({ onSend, onStart }: { onSend: (message: string) => void; onStart?: () => void }) {
  const [draft, setDraft] = useState("");
  const field = useRef<HTMLTextAreaElement>(null);
  const hasMessage = draft.trim().length > 0;
  useLayoutEffect(() => {
    if (!field.current) return;
    field.current.style.height = "auto";
    field.current.style.height = `${Math.min(field.current.scrollHeight, 120)}px`;
  }, [draft]);
  const submit = () => {
    if (hasMessage) {
      onSend(draft.trim());
      setDraft("");
    } else {
      onStart?.();
    }
  };
  return (
    <div className="glide-composer-dock shrink-0">
      <form
        data-slot="composer"
        className="glide-glass glide-composer flex items-end gap-2 rounded-xl bg-card"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <textarea
          ref={field}
          rows={1}
          data-slot="composer-input"
          aria-label="Message Glide"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Message Glide…"
          enterKeyHint="send"
          autoComplete="off"
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing || event.keyCode === 229) return;
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          className="min-w-0 flex-1 resize-none py-2.5 text-base leading-6 text-foreground placeholder:text-muted-foreground"
        />
        <GlassButton type="submit" variant={!hasMessage && onStart ? "primary" : "ghost"} aria-label={!hasMessage && onStart ? "Start trip" : "Send message"} disabled={!hasMessage && !onStart} className="shrink-0 px-3">
          {!hasMessage && onStart ? "Start" : <ArrowUp className="h-5 w-5" aria-hidden />}
        </GlassButton>
      </form>
    </div>
  );
}

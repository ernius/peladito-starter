import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { logout, useCurrentUser } from "../../auth/useAuth";
import { useChat } from "../useChat";
import Markdown from "react-markdown";

export const ChatPage = () => {
  const { data: user } = useCurrentUser();
  const { messages, sendMessage, error } = useChat();
  const [draft, setDraft] = useState("");

  const onSubmit = (event: React.FormEvent): void => {
    event.preventDefault();
    const content = draft.trim();

    if (!content) return;

    sendMessage(content);
    setDraft("");
  };

  return (
    <main className="mx-auto flex h-svh max-w-3xl flex-col p-4">
      <header className="flex items-center justify-between border-b pb-3">
        <div>
          <h1 className="text-lg font-semibold">Peladito Architect</h1>
          {user && (
            <p className="text-sm text-muted-foreground">{user.displayName}</p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={logout}>
          Salir
        </Button>
      </header>

      <ScrollArea className="flex-1 py-4">
        {messages.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Pregunta sobre las decisiones de arquitectura del proyecto.
          </p>
        ) : (
          <div className="flex flex-col gap-3 pr-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                  message.role === "user"
                    ? "self-end bg-primary text-primary-foreground"
                    : "self-start bg-muted",
                )}
              >
                <Markdown>{message.content}</Markdown>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {error && (
        <p className="border-t pt-3 text-sm text-destructive">{error}</p>
      )}

      <form onSubmit={onSubmit} className="flex gap-2 border-t pt-3">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Escribe tu pregunta…"
        />
        <Button type="submit" disabled={!draft.trim()}>
          Enviar
        </Button>
      </form>
    </main>
  );
};

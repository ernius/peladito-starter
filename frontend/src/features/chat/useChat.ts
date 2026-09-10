import { useState } from "react";
import type { ChatMessage } from "./chat.types";
import axios from "axios";
import { api } from "@/lib/api";
import type { ChatRequestDto, ArchitectResponse } from "backend";

const DEFAULT_ERROR_MESSAGE = "No se pudo enviar el mensaje. Intenta de nuevo.";

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (content: string): Promise<void> => {
    // TODO(participante): reemplazar por la llamada real al backend
    // (semana 2), p. ej. api.post('/chat', { message: content }).

    let payload: ChatRequestDto = { prompt: content };
    // curl  -d '{ "prompt" : "hola" }'  -H "API-Version: 1" -H "Content-Type: application/json" localhost:3000/api/chat
    let res: ArchitectResponse;
    try {
      ({ data: res } = await api.post<ArchitectResponse>("/chat", payload));
    } catch (err) {
      console.log(err);
      const message =
        axios.isAxiosError(err) &&
        typeof err.response?.data?.message === "string"
          ? err.response.data.message
          : DEFAULT_ERROR_MESSAGE;

      setError(message);
      return;
    }

    setError(null);
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content },
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          res.plainLanguageAnswer ??
          res.escalationReason ??
          "Sin respuesta del asistente.",
      },
    ]);
  };

  return { messages, sendMessage, error };
};

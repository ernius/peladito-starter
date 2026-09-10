import { useState } from "react";
import type { ChatMessage } from "./chat.types";
import axios from "axios";
import type { ChatRequestDto, ArchitectResponse } from "backend";

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const api = axios.create({
    baseURL: "http://localhost:3000/api",
    headers: {
      "Content-Type": "application/json",
      "API-Version": "1",
    },
  });

  const sendMessage = async (content: string): Promise<void> => {
    // TODO(participante): reemplazar por la llamada real al backend
    // (semana 2), p. ej. api.post('/chat', { message: content }).

    let payload: ChatRequestDto = { prompt: content };
    // curl  -d '{ "prompt" : "hola" }'  -H "API-Version: 1" -H "Content-Type: application/json" localhost:3000/api/chat
    let res: ArchitectResponse = await api.post("/chat", payload);

    console.log(res);

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content },
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: res.plainLanguageAnswer,
      },
    ]);
  };

  return { messages, sendMessage };
};

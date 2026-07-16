import { useState } from 'react';
import type { ChatMessage } from './chat.types';

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const sendMessage = (content: string): void => {
    // TODO(participante): reemplazar por la llamada real al backend
    // (semana 2), p. ej. api.post('/chat', { message: content }).
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', content },
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content:
          'Todavía no estoy conectado a ningún modelo. Implementa el endpoint de chat en el backend (semana 2).',
      },
    ]);
  };

  return { messages, sendMessage };
};

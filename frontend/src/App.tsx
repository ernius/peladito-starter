import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAuth } from '@/components/RequireAuth';
import { LoginPage } from '@/features/auth/LoginPage';
import { ChatPage } from '@/features/chat/ChatPage';

export const App = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route
      path="/"
      element={
        <RequireAuth>
          <ChatPage />
        </RequireAuth>
      }
    />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

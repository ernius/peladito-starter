import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { getToken } from '@/lib/api';

interface Props {
  children: ReactNode;
}

export const RequireAuth = ({ children }: Props) => {
  if (!getToken()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

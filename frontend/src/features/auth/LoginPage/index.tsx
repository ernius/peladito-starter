import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLogin } from '../useAuth';

const schema = z.object({
  email: z.string().email('Ingresa un email válido'),
  displayName: z.string().min(2, 'Ingresa tu nombre'),
});

type FormValues = z.infer<typeof schema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit((values) => {
    login.mutate(values, { onSuccess: () => navigate('/') });
  });

  return (
    <main className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Peladito Architect</CardTitle>
          <CardDescription>
            Ingresa con tu nombre y email para comenzar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="displayName">Nombre</Label>
              <Input id="displayName" {...register('displayName')} />
              {errors.displayName && (
                <p className="text-sm text-destructive">
                  {errors.displayName.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={login.isPending}>
              {login.isPending ? 'Ingresando…' : 'Ingresar'}
            </Button>
            {login.isError && (
              <p className="text-sm text-destructive">
                No pudimos iniciar sesión. Revisa que el backend esté corriendo.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useIsAuthenticated, useLogin } from '@refinedev/core';
import { useRouter } from 'next/navigation';

export default function LoginPage(): React.JSX.Element {
  const router = useRouter();
  const { mutateAsync: login, isPending } = useLogin();
  const { data, isLoading } = useIsAuthenticated();
  const [tenantId, setTenantId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isLoading && data?.authenticated) {
      router.replace('/tenants');
    }
  }, [data?.authenticated, isLoading, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setErrorMessage('');

    const result = await login({
      tenantId,
      email,
      password,
    });

    if (!result?.success) {
      setErrorMessage(result?.error?.message ?? 'Nao foi possivel entrar.');
      return;
    }

    router.push(result.redirectTo ?? '/tenants');
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <span className="auth-kicker">Web Fretes Admin</span>
          <h1>Painel administrativo do Web Fretes</h1>
          <p>
            Base inicial do frontend SaaS para operacao de tenants e usuarios.
          </p>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field">
            <span>Tenant ID</span>
            <input
              value={tenantId}
              onChange={(event) => setTenantId(event.target.value)}
              placeholder="UUID do tenant"
            />
          </label>

          <label className="field">
            <span>E-mail</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@empresa.com"
            />
          </label>

          <label className="field">
            <span>Senha</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Sua senha"
            />
          </label>

          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

          <button className="primary-button" disabled={isPending} type="submit">
            {isPending ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="auth-footer">
          <span>Frontend preparado para Refine + Next.js</span>
          <Link href="/tenants">Ir para o painel</Link>
        </div>
      </section>
    </main>
  );
}

import { AuthProvider } from '@refinedev/core';

const AUTH_STORAGE_KEY = 'sdf-auth';

export const authProvider: AuthProvider = {
  login: async ({ email, password, tenantId }) => {
    if (!email || !password || !tenantId) {
      return {
        success: false,
        error: {
          name: 'ValidationError',
          message: 'Tenant, email e senha sao obrigatorios.',
        },
      };
    }

    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        id: email,
        name: email,
        email,
        tenantId,
      }),
    );

    return {
      success: true,
      redirectTo: '/tenants',
    };
  },
  logout: async () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return {
      success: true,
      redirectTo: '/login',
    };
  },
  check: async () => {
    const session = localStorage.getItem(AUTH_STORAGE_KEY);

    if (session) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      logout: false,
      redirectTo: '/login',
    };
  },
  getPermissions: async () => null,
  getIdentity: async () => {
    const session = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!session) {
      return null;
    }

    const parsed = JSON.parse(session) as {
      id: string;
      name: string;
      email: string;
      tenantId: string;
    };

    return {
      id: parsed.id,
      name: parsed.name,
      email: parsed.email,
      tenantId: parsed.tenantId,
    };
  },
  onError: async () => {
    return {
      error: {
        message: 'Falha na autenticacao.',
        name: 'AuthError',
      },
    };
  },
};

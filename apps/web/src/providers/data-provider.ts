import {
  BaseRecord,
  CreateParams,
  DataProvider,
  GetListParams,
  GetManyParams,
  GetOneParams,
  HttpError,
} from '@refinedev/core';

function buildHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = 'Erro ao comunicar com a API.';

    try {
      const errorBody = (await response.json()) as { message?: string };
      message = errorBody.message ?? message;
    } catch {
      message = response.statusText || message;
    }

    throw {
      message,
      statusCode: response.status,
    } as HttpError;
  }

  return (await response.json()) as T;
}

export function dataProvider(apiUrl: string): DataProvider {
  const baseUrl = apiUrl.replace(/\/$/, '');

  return {
    getApiUrl: () => baseUrl,
    getList: async <TData extends BaseRecord = BaseRecord>(
      params: GetListParams,
    ) => {
      const { resource, pagination } = params;
      const response = await fetch(`${baseUrl}/${resource}`, {
        headers: buildHeaders(),
        cache: 'no-store',
      });
      const data = await parseResponse<TData[]>(response);

      if (!Array.isArray(data)) {
        throw {
          message: `Resposta invalida para listagem de ${resource}.`,
          statusCode: 500,
        } as HttpError;
      }

      const current = pagination?.current ?? 1;
      const pageSize = pagination?.pageSize ?? (data.length || 1);
      const start = (current - 1) * pageSize;
      const end = start + pageSize;

      return {
        data: data.slice(start, end),
        total: data.length,
      };
    },
    getOne: async <TData extends BaseRecord = BaseRecord>(
      params: GetOneParams,
    ) => {
      const { resource, id } = params;
      const response = await fetch(`${baseUrl}/${resource}/${id}`, {
        headers: buildHeaders(),
        cache: 'no-store',
      });
      const data = await parseResponse<TData>(response);

      return {
        data,
      };
    },
    create: async <
      TData extends BaseRecord = BaseRecord,
      TVariables = {}
    >(
      params: CreateParams<TVariables>,
    ) => {
      const { resource, variables } = params;
      const response = await fetch(`${baseUrl}/${resource}`, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify(variables),
      });
      const data = await parseResponse<TData>(response);

      return {
        data,
      };
    },
    update: async () => {
      throw new Error('Update ainda nao implementado na Fase 1.');
    },
    deleteOne: async () => {
      throw new Error('Delete ainda nao implementado na Fase 1.');
    },
    getMany: async <TData extends BaseRecord = BaseRecord>(
      params: GetManyParams,
    ) => {
      const { resource, ids } = params;
      const records = await Promise.all(
        ids.map(async (id: string | number) => {
          const response = await fetch(`${baseUrl}/${resource}/${id}`, {
            headers: buildHeaders(),
            cache: 'no-store',
          });
          return parseResponse<TData>(response);
        }),
      );

      return {
        data: records,
      };
    },
    createMany: async () => {
      throw new Error('CreateMany ainda nao implementado na Fase 1.');
    },
    updateMany: async () => {
      throw new Error('UpdateMany ainda nao implementado na Fase 1.');
    },
    deleteMany: async () => {
      throw new Error('DeleteMany ainda nao implementado na Fase 1.');
    },
    custom: async () => {
      throw new Error('Custom ainda nao implementado na Fase 1.');
    },
  };
}

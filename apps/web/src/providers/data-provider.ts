import {
  BaseRecord,
  CreateParams,
  CrudFilter,
  DataProvider,
  DeleteOneParams,
  GetListParams,
  GetManyParams,
  GetOneParams,
  HttpError,
  UpdateParams,
  CustomParams,
} from '@refinedev/core';
import { resolveApiBaseUrl } from '../lib/api-base-url';

function buildHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
  };
}

function isSimpleFilter(filter: CrudFilter): filter is Extract<CrudFilter, { field: string }> {
  return 'field' in filter && 'operator' in filter;
}

function buildQueryString(params?: GetListParams): string {
  const searchParams = new URLSearchParams();

  params?.filters?.forEach((filter) => {
    if (!isSimpleFilter(filter)) {
      return;
    }

    const { field, operator, value } = filter;

    if (value === undefined || value === null || value === '') {
      return;
    }

    if (operator === 'eq' || operator === 'contains') {
      searchParams.set(field, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = 'Erro ao comunicar com a API.';

    try {
      const errorBody = (await response.json()) as {
        message?: string | string[];
      };
      message = Array.isArray(errorBody.message)
        ? errorBody.message.join(', ')
        : (errorBody.message ?? message);
    } catch {
      message = response.statusText || message;
    }

    throw {
      message,
      statusCode: response.status,
    } as HttpError;
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}

export function dataProvider(apiUrl: string): DataProvider {
  const baseUrl = resolveApiBaseUrl(apiUrl);

  return {
    getApiUrl: () => baseUrl,
    getList: async <TData extends BaseRecord = BaseRecord>(
      params: GetListParams,
    ) => {
      const { resource, pagination } = params;
      const queryString = buildQueryString(params);
      const response = await fetch(`${baseUrl}/${resource}${queryString}`, {
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
    update: async <
      TData extends BaseRecord = BaseRecord,
      TVariables = {}
    >(
      params: UpdateParams<TVariables>,
    ) => {
      const { resource, id, variables } = params;
      const response = await fetch(`${baseUrl}/${resource}/${id}`, {
        method: 'PATCH',
        headers: buildHeaders(),
        body: JSON.stringify(variables),
      });
      const data = await parseResponse<TData>(response);

      return {
        data,
      };
    },
    deleteOne: async <
      TData extends BaseRecord = BaseRecord,
      TVariables = {}
    >(
      params: DeleteOneParams<TVariables>,
    ) => {
      const { resource, id } = params;
      const response = await fetch(`${baseUrl}/${resource}/${id}`, {
        method: 'DELETE',
        headers: buildHeaders(),
      });
      const data = await parseResponse<TData>(response);

      return {
        data,
      };
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
      throw new Error('CreateMany ainda nao implementado.');
    },
    updateMany: async () => {
      throw new Error('UpdateMany ainda nao implementado.');
    },
    deleteMany: async () => {
      throw new Error('DeleteMany ainda nao implementado.');
    },
    custom: async <TData extends BaseRecord = BaseRecord>(
      params: CustomParams,
    ) => {
      const url = params.url.startsWith('http')
        ? params.url
        : `${baseUrl}${params.url.startsWith('/') ? '' : '/'}${params.url}`;
      const response = await fetch(url, {
        method: params.method,
        headers: buildHeaders(),
        body:
          params.method === 'get' || params.payload === undefined
            ? undefined
            : JSON.stringify(params.payload),
        cache: 'no-store',
      });
      const data = await parseResponse<TData>(response);

      return {
        data,
      };
    },
  };
}

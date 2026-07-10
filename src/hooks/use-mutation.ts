/**
 * Mutation Hook
 *
 * SWR-based mutation helper for POST/PUT/PATCH/DELETE operations.
 * Wraps useSWRMutation and provides automatic cache invalidation.
 */

'use client';

import useSWRMutation, { SWRMutationConfiguration } from 'swr/mutation';
import { postJson, putJson, patchJson, deleteJson } from '@/lib/api-fetch';
import { mutate } from 'swr';
import type { Key } from 'swr';

type FetcherArgs<Data> = {
  url: string;
  data?: Data;
};

type HttpMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

async function mutationFetcher<Data, Result>(
  url: string,
  { arg }: { arg: FetcherArgs<Data> & { method: HttpMethod } }
): Promise<Result> {
  const { method, data } = arg;
  switch (method) {
    case 'POST':
      return postJson<Result>(url, data);
    case 'PUT':
      return putJson<Result>(url, data);
    case 'PATCH':
      return patchJson<Result>(url, data);
    case 'DELETE':
      return deleteJson<Result>(url);
    default:
      throw new Error(`Unsupported HTTP method: ${method}`);
  }
}

export function useMutation<Data = unknown, Result = unknown>(
  key: Key,
  options?: SWRMutationConfiguration<Result, Error, Key, FetcherArgs<Data> & { method: HttpMethod }>,
) {
  return useSWRMutation<Result, Error, Key, FetcherArgs<Data> & { method: HttpMethod }>(
    key,
    mutationFetcher<Data, Result>,
    options,
  );
}

export async function invalidateCache(key: Key): Promise<void> {
  await mutate(key);
}

export async function invalidateMultiple(keys: Key[]): Promise<void> {
  await Promise.all(keys.map((k) => mutate(k)));
}

export { mutationFetcher };
export default useMutation;

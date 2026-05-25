type QueryOrMutationOptions<TData = unknown, TError = unknown> = {
  onStart?: () => void;
  fn: (...args: any[]) => Promise<TData>;
  onSuccess?: (response: TData) => void;
  onError?: (error: TError) => void;
  onEnd?: () => void;
  defaultArgs?: any[];
  enabled?: boolean;
};

function useQueryOrMutation<TData = unknown, TError = unknown>({
  onStart = () => {},
  fn,
  onSuccess = () => {},
  onError = () => {},
  onEnd = () => {},
  defaultArgs = [],
  enabled = true,
}: QueryOrMutationOptions<TData, TError>): (...args: any[]) => Promise<void> {
  async function doFn(...args: any[]): Promise<void> {
    onStart();
    try {
      const response = await fn(...args);
      onSuccess(response);
    } catch (error) {
      onError(error as TError);
      throw error;
    } finally {
      onEnd();
    }
  }

  if (enabled) setTimeout(() => doFn(...defaultArgs), 0);

  return doFn;
}

export type UseQueryOptions<TData = unknown, TError = unknown> = Omit<
  QueryOrMutationOptions<TData, TError>,
  'fn'
> & {
  queryFn: (...args: any[]) => Promise<TData>;
};

export type UseQueryResult = {
  refetch: (...args: any[]) => Promise<void>;
};

export function useQuery<TData = unknown, TError = unknown>({
  queryFn,
  ...props
}: UseQueryOptions<TData, TError>): UseQueryResult {
  const doFn = useQueryOrMutation({ fn: queryFn, ...props });
  return { refetch: doFn };
}

export type UseMutationOptions<TData = unknown, TError = unknown> = Omit<
  QueryOrMutationOptions<TData, TError>,
  'fn' | 'enabled'
> & {
  mutationFn: (...args: any[]) => Promise<TData>;
};

export type UseMutationResult = {
  mutate: (...args: any[]) => Promise<void>;
};

export function useMutation<TData = unknown, TError = unknown>({
  mutationFn,
  ...props
}: UseMutationOptions<TData, TError>): UseMutationResult {
  const doFn = useQueryOrMutation({
    fn: mutationFn,
    ...props,
    enabled: false,
  });
  return { mutate: doFn };
}

function useQueryOrMutation({
  onStart = () => { },
  fn,
  onSuccess = () => { },
  onError = () => { },
  onEnd = () => { },
  defaultArgs = [],
  enabled = true,
}) {
  async function doFn(...args) {
    onStart();
    try {
      const response = await fn(...args);
      onSuccess(response);
    } catch (error) {
      onError(error);
      throw error;
    } finally {
      onEnd();
    }
  }

  if (enabled) setTimeout(() => doFn(...defaultArgs), 0);

  return doFn;
}

export function useQuery({ queryFn, ...props }) {
  const doFn = useQueryOrMutation({ fn: queryFn, ...props });
  return { refetch: doFn };
}

export function useMutation({ mutationFn, ...props }) {
  const doFn = useQueryOrMutation({ fn: mutationFn, ...props, enabled: false });
  return { mutate: doFn };
}

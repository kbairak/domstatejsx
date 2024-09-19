export function useQuery({
  onStart = () => { },
  queryFn,
  onSuccess = () => { },
  onError = () => { },
  onEnd = () => { },
  defaultArgs = [],
  enabled = true,
}) {
  async function refetch(...args) {
    onStart();
    try {
      const response = await queryFn(...args);
      onSuccess(response);
    } catch (error) {
      onError(error);
      throw error;
    } finally {
      onEnd();
    }
  }

  if (enabled) setTimeout(() => refetch(...defaultArgs), 0);

  return { refetch };
}

export function useMutation({
  onStart = () => { },
  mutationFn,
  onSuccess = () => { },
  onError = () => { },
  onEnd = () => { },
}) {
  async function mutate(...args) {
    onStart();
    try {
      const response = await mutationFn(...args);
      onSuccess(response);
    } catch (error) {
      onError(error);
      throw error;
    } finally {
      onEnd();
    }
  }

  return { mutate };
}

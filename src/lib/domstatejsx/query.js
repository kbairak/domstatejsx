class Query {
  constructor({
    queryFn,
    onStart = () => {},
    onEnd = () => {},
    onSuccess = () => {},
    onError = () => {},
  }) {
    this.queryFn = queryFn;
    this.onStart = onStart;
    this.onEnd = onEnd;
    this.onSuccess = onSuccess;
    this.onError = onError;
  }

  async query(...args) {
    this.onStart();
    try {
      const data = await this.queryFn(...args);
      this.onSuccess(data);
    } catch (error) {
      this.onError(error);
    }
    this.onEnd();
  }
}

export function useQuery({ active = true, ...props }) {
  const result = new Query(props);
  result.fetch = result.query.bind(result);
  if (active) setTimeout(result.fetch, 0);
  return result;
}

export function useMutation({ ...props }) {
  const result = new Query(props);
  result.mutate = result.query.bind(result);
  return result;
}

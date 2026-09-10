import {
  QueryClient,
  defaultShouldDehydrateQuery,
  isServer,
} from "@tanstack/react-query";

const isClientError = (error) => {
  const status = Number(Reflect.get(Object(error), "status"));

  return Number.isFinite(status) && status >= 400 && status < 500;
};

const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: (failureCount, error) =>
          isClientError(error) ? false : failureCount < 2,
        refetchOnWindowFocus: true,
      },
      mutations: {
        retry: false,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending",
      },
    },
  });

let browserQueryClient;

export const getQueryClient = () => {
  if (isServer) return makeQueryClient();

  browserQueryClient ??= makeQueryClient();

  return browserQueryClient;
};

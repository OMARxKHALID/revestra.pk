export const onRequestError = async (error, request, context) => {
  const { captureServerException } = await import("@/lib/api/analytics");
  const { viewerIdFromCookie } = await import("@/lib/api/viewer-id");

  await captureServerException(error, {
    distinctId: viewerIdFromCookie(request?.headers?.cookie),
    path: request?.path ?? null,
    method: request?.method ?? null,
    router: context?.routerKind ?? null,
    route: context?.routePath ?? null,
    route_type: context?.routeType ?? null,
  });
};

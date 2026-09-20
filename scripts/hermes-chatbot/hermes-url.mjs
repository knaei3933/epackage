export function normalizeHermesServiceRoot(value) {
  const withoutTrailingSlashes = value?.trim().replace(/\/+$/, '') ?? '';
  const serviceRoot = withoutTrailingSlashes.endsWith('/v1')
    ? withoutTrailingSlashes.slice(0, -3)
    : withoutTrailingSlashes;

  const url = new URL(serviceRoot);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new TypeError('Hermes base URL must use http or https');
  }
  return serviceRoot;
}

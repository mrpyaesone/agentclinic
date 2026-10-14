export function getPort(configuredPort: string | undefined): number {
  const port = configuredPort === undefined ? 3000 : Number(configuredPort);

  if (
    (configuredPort !== undefined && !/^\d+$/.test(configuredPort)) ||
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535
  ) {
    throw new Error('Invalid PORT: expected an integer between 1 and 65535.');
  }

  return port;
}

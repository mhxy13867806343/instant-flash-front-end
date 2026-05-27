export async function requestMock<T>(factory: () => T, delay = 0) {
  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  return factory();
}

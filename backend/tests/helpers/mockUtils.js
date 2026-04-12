export const mockMethod = (target, methodName, implementation) => {
  const original = target[methodName];
  target[methodName] = implementation;

  return () => {
    target[methodName] = original;
  };
};

export const createJsonRequest = (baseUrl, path, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  return fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });
};

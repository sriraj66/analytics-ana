function request(url: string, options: RequestInit, timeout = 30000): Promise<Response> {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error('Request Timedout')), timeout)
    ),
  ]);
}

export default request;
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function fetchJson<T>(url: string, init?: RequestInit, retries = 2): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...init,
        headers: {
          accept: "application/json",
          ...(init?.headers ?? {})
        },
        next: { revalidate: 180 }
      });

      if (!response.ok) {
        if ([429, 500, 502, 503, 504].includes(response.status) && attempt < retries) {
          await delay(350 * (attempt + 1));
          continue;
        }
        throw new ApiError(`Request failed with ${response.status}`, response.status);
      }

      return (await response.json()) as T;
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await delay(350 * (attempt + 1));
        continue;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Unknown network error");
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

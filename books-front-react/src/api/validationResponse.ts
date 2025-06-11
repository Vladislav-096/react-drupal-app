export class CustomError extends Error {
  public readonly code: string;

  constructor(code: number, message: string) {
    super(message);
    this.code = code.toString();

    // Важно для корректной работы instanceof
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export async function validateApiResponse(
  response: Response
): Promise<Response> {
  if (!response.ok) {
    const status = response.status;

    // Попытаемся прочитать JSON-ошибку с бэка
    let message = "Unknown error, try again later";

    try {
      const errorBody = await response.json();
      if (errorBody?.error) {
        message = errorBody.error;
      }
    } catch {
      console.log("nothing happens");
    }

    if (status === 404) {
      throw new CustomError(
        404,
        message || "Data is not found. Try again later"
      );
    } else if (status >= 500 && status < 600) {
      throw new CustomError(500, message || "Server error");
    } else if (status === 401) {
      throw new CustomError(401, message || "Unauthorized");
    } else {
      throw new CustomError(status, message);
    }
  }

  return response;
}

export async function validateResponse(response: Response): Promise<Response> {
  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response;
}

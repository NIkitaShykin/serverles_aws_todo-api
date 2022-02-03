export class ValidationError extends Error {
  public statusCode: number = 400;
  constructor(body: Record<string, unknown> = {}) {
    super(JSON.stringify(body));
  }
}

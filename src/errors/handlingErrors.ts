export const handlingErrors = (statusCode: number, body: string) => {
  return {
    statusCode: statusCode,
    body: body,
    headers: { "Content-Type": "application/json" },
  };
};

export default function checkParams(
  params: any,
  requiredParams: string[],
): void {
  if (!params) {
    throw new Error(`Parameters object is null or undefined`);
  }
  for (const param of requiredParams) {
    if (!(param in params)) {
      throw new Error(`Missing required parameter: ${param}`);
    }
  }
}

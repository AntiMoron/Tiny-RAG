export default function checkParams(
  params: any,
  requiredParams: string[],
): void {
  for (const param of requiredParams) {
    if (!(param in params)) {
      throw new Error(`Missing required parameter: ${param}`);
    }
  }
}

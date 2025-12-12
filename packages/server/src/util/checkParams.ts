import { HttpException, HttpStatus } from '@nestjs/common';

export default function checkParams(
  params: any,
  requiredParams: string[],
): void {
  if (!params) {
    throw new HttpException(
      `Parameters object is null or undefined`,
      HttpStatus.BAD_REQUEST,
    );
  }
  for (const param of requiredParams) {
    if (!(param in params)) {
      throw new HttpException(
        `Missing required parameter: ${param}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

export function checkNotHaveParams(
  params: any,
  notAllowedParams: string[],
): void {
  if (!params) {
    return;
  }
  for (const param of notAllowedParams) {
    if (param in params) {
      throw new HttpException(
        `Parameter not allowed: ${param}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

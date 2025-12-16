// src/common/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

// this is a interface exported to API document
export const IS_API_KEY = 'isAPIExported';
export const TinyRAGAPI = () => SetMetadata(IS_API_KEY, true);

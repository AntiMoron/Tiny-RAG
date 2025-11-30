import { Injectable } from '@nestjs/common';
import {
  AICompletionResponse,
} from '../types/completion';
import axios from 'axios';
import * as _ from 'lodash';
import { AIProvider } from '../types/aiprovider';
import { AiproviderService } from 'src/aiprovider/aiprovider.service';

@Injectable()
export class CompletionService {
  constructor(private readonly providerService: AiproviderService) {}

  async handleAIProviderConfiguration(
    provider: AIProvider,
    promptInput: string,
  ): Promise<any> {
    const { config, name, type, id } = provider;
    const { endpoint, headers, method, paramMapping, resultMapping } = config;

    const valueOptions: any = {
      ...config,
      input: promptInput,
    };

    function replaceValues<T>(origin: any, options: Record<string, string>) {
      let newParams = {};
      Object.keys(origin).forEach((key) => {
        let mappingValue = origin[key];
        // needs var replacement
        const reg = /\{\{([a-zA-Z0-9\_\(\)]+?)\}\}/g;
        if (reg.test(mappingValue)) {
          mappingValue = mappingValue.replace(reg, (_, varName) => {
            const reg2 = /^const\(([a-zA-Z0-9]+?)\)$/;
            if (reg2.test(varName)) {
              return varName.match(reg2)![1];
            }
            const value = options[varName];
            return `${value || ''}`;
          });
        }
        _.set(newParams, key, mappingValue);
      });
      return newParams as T;
    }

    if (method === 'GET') {
      return axios
        .get(endpoint, {
          headers: replaceValues(headers, valueOptions),
          params: replaceValues(paramMapping, valueOptions),
        })
        .then((a) => a.data)
        .then((result) => {
          if (resultMapping) {
            return {
              ...Object.keys(resultMapping).reduce((acc, key) => {
                _.set(acc, resultMapping[key], _.get(result, key));
                return acc;
              }, {} as any),
            };
          }
          return result;
        });
    } else if (method === 'POST') {
      return axios
        .post(endpoint, replaceValues(paramMapping, valueOptions), {
          headers: replaceValues(headers, valueOptions),
        })
        .then((a) => a.data)
        .then((result) => {
          if (resultMapping) {
            return {
              ...Object.keys(resultMapping).reduce((acc, key) => {
                _.set(acc, resultMapping[key], _.get(result, key));
                return acc;
              }, {} as any),
            };
          }
          return result;
        });
    }
    throw new Error(`Unsupported method: ${method}`);
  }

  async completeById(
    providerId: string,
    prompt: string,
  ): Promise<AICompletionResponse | undefined> {
    const provider = await this.providerService.findOne(providerId);
    if (!provider) {
      throw new Error('No provider found!');
    }
    if (provider.type !== 'completion') {
      throw new Error('Provider is not for AI completion.');
    }
    try {
      const data = await this.handleAIProviderConfiguration(
        { ...(provider as any) },
        prompt,
      );
      return data;
    } catch (err) {
      throw new Error(`AI Completion failed: ${(err as Error).message}`);
    }
  }
}

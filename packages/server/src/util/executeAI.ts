import { AIProvider } from 'tinyrag-types/aiprovider';
import * as _ from 'lodash';
import axios from 'axios';
import { AICompletionResponse } from 'tinyrag-types/completion';
import { AIEmbeddingResponse } from 'tinyrag-types/embedding';

function replaceValues<O extends Record<string, string>>(
  origin: O,
  options: Record<string, string>,
) {
  const newParams: Record<string, string | number | boolean> = {};
  Object.keys(origin).forEach((key) => {
    let mappingValue = origin[key];
    // needs var replacement
    const reg = /\{\{([a-zA-Z0-9_()]+?)\}\}/g;
    if (reg.test(mappingValue)) {
      mappingValue = mappingValue.replace(reg, (_, varName: string) => {
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
  return newParams as O;
}

export default async function handleAIProviderConfiguration<
  T extends AICompletionResponse | AIEmbeddingResponse,
>(provider: AIProvider, promptInput: string): Promise<T> {
  const { config } = provider;
  const { endpoint, headers, method, paramMapping, resultMapping, model } =
    config;

  const valueOptions = {
    ...config,
    input: promptInput,
  } as unknown as Record<string, string>;

  let promise: Promise<T> | undefined;
  if (method === 'GET') {
    promise = axios
      .get(endpoint, {
        headers: replaceValues(headers as Record<string, string>, valueOptions),
        params: replaceValues(paramMapping, valueOptions),
      })
      .then((a) => a.data);
  } else if (method === 'POST') {
    promise = axios
      .post(endpoint, replaceValues(paramMapping, valueOptions), {
        headers: replaceValues(headers as Record<string, string>, valueOptions),
      })
      .then((a) => a.data);
  }
  if (promise) {
    return promise.then((result) => {
      if (resultMapping) {
        return {
          ...Object.keys(resultMapping).reduce((acc, key) => {
            const v = resultMapping[key];
            _.set(acc, key, _.get(result, v));
            return acc as T;
          }, {} as any),
          providerId: provider.id,
          model: model || provider.config.model,
        } as T;
      }
      return {
        ...result,
        providerId: provider.id,
        model: model || provider.config.model,
      };
    });
  }
  throw new Error(`Unsupported method: ${method}`);
}

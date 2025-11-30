import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { AIProvider } from 'src/types/aiprovider';
import { AIEmbeddingResponse } from 'src/types/embedding';
import * as _ from 'lodash';
import { Knowledge } from 'src/types/knowledge';
import { KnowledgeService } from 'src/knowledge/knowledge.service';
import getDefaultConfig from 'src/default_config';

@Injectable()
export class EmbeddingService {
  constructor(private readonly knowledgeService: KnowledgeService) {}

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

  async embedById(
    providerId: string,
    prompt: string,
  ): Promise<AIEmbeddingResponse | undefined> {
    // const provider = await this.providerService.findOne(providerId);
    const provider = getDefaultConfig('embedding', 'defaultProvider') as AIProvider;
    if (!provider) {
      throw new Error('No provider found!');
    }
    if (provider.type !== 'embedding') {
      throw new Error('Provider is not for AI embedding.');
    }
    try {
      const data = await this.handleAIProviderConfiguration(
        { ...(provider as any) },
        prompt,
      );
      return data;
    } catch (err) {
      throw new Error(`AI Embedding failed: ${(err as Error).message}`);
    }
  }

  async retriveKnowledgeById(
    providerId: string,
    datasetId: string,
    prompt: string,
  ): Promise<(Knowledge & { score: number })[]> {
    const questionEmbed = await this.embedById(providerId, prompt);
    const similarityThreshold = 0.75;
    if (!questionEmbed?.data.result) {
      throw new Error('Failed to get embedding for the prompt.');
    }
    const results = await this.knowledgeService.findSimilarKnowledge(
      datasetId,
      questionEmbed.data.result,
    );

    const newResult = results
      .map((item) => ({
        ...item,
        score: item.score,
      }))
      .filter((item) => item.score >= similarityThreshold);
    const knowledge_ids = newResult.map((item) => item.knowledge_id);
    const knowledges = await this.knowledgeService.findByIds(knowledge_ids);
    return knowledges.map((k) => {
      const score =
        newResult.find((item) => item.knowledge_id === k.id)?.score || 0;
      return {
        ...k,
        score,
      };
    });
  }
}

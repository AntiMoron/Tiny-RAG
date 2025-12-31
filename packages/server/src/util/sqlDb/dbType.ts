import path from 'path';
import getEnvConfigValue from '../getEnvConfigValue';
import { readFileSync, existsSync } from 'fs';

const envFile = path.resolve(__dirname, '../../../', '.env');

function readEnvConfig() {
  if (!existsSync(envFile)) return {};
  const fileContent = readFileSync(envFile, 'utf-8')
    .split('\n')
    .map((a) => a.split('='))
    .map((a) => a.map((aa) => aa.trim()))
    .reduce(
      (pre, acc) => {
        pre[acc[0]] = acc[1];
        return pre;
      },
      {} as Record<string, string>,
    );
  return fileContent;
}

let value =
  readEnvConfig()['DATABASE_TYPE'] || getEnvConfigValue('DATABASE_TYPE');

export default function getDbType(flush?: boolean): 'sqlite' | 'mysql' {
  if (flush) {
    value = getEnvConfigValue('DATABASE_TYPE');
  }
  return value as unknown as 'sqlite' | 'mysql';
}

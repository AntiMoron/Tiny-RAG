import getEnvConfigValue from '../getEnvConfigValue';

const dbType = getEnvConfigValue('DATABASE_TYPE');

export default function getCurrentTime(): string {
  if (dbType === 'sqlite') {
    return "datetime('now')";
  }
  return 'CURRENT_TIMESTAMP';
}

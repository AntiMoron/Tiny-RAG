import getEnvConfigValue from '../getEnvConfigValue';

export default function getCurrentTime(): string {
  const dbType = getEnvConfigValue('DATABASE_TYPE');
  if (dbType === 'sqlite') {
    return "datetime('now')";
  }
  return 'CURRENT_TIMESTAMP';
}

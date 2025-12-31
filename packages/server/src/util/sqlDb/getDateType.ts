import getEnvConfigValue from '../getEnvConfigValue';

export function getDateType(): 'datetime' | 'timestamp' {
  const dbType = getEnvConfigValue('DATABASE_TYPE');
  if (dbType === 'sqlite') {
    return 'datetime';
  }
  return 'timestamp';
}

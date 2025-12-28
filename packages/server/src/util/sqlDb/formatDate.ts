import getEnvConfigValue from '../getEnvConfigValue';

export default function formatDate(field: string, format: string): string {
  const dbType = getEnvConfigValue('DATABASE_TYPE');
  if (dbType === 'sqlite') {
    return `strftime('${format}', ${field})`;
  }
  return `DATE_FORMAT(${field}, '${format}')`;
}

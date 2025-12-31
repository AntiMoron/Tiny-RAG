import getDbType from './dbType';

export default function formatDate(field: string, format: string): string {
  const dbType = getDbType();
  if (dbType === 'sqlite') {
    return `strftime('${format}', ${field})`;
  }
  return `DATE_FORMAT(${field}, '${format}')`;
}

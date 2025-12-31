import getDbType from './dbType';

export default function getCurrentTime(precision?: number): string {
  const dbType = getDbType();
  if (dbType === 'sqlite') {
    return "datetime('now')";
  }
  if (
    typeof precision === 'number' &&
    precision === precision &&
    precision > 0
  ) {
    return `CURRENT_TIMESTAMP(${precision})`;
  }
  return 'CURRENT_TIMESTAMP';
}

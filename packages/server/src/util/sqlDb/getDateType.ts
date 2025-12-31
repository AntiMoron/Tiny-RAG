import getDbType from './dbType';

export function getDateType(): 'datetime' | 'timestamp' {
  const dbType = getDbType();
  if (dbType === 'sqlite') {
    return 'datetime';
  }
  return 'timestamp';
}

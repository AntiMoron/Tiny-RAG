import * as crypto from 'crypto';

export default function sha256(
  data: string,
  encoding: BufferEncoding = 'utf8',
): string {
  return crypto.createHash('sha256').update(data, encoding).digest('hex'); // 输出格式：hex/base64/binary
}

/**
 * SHA256 加密（带盐值，适用于密码）
 * @param password 原始密码
 * @param salt 盐值（不传则自动生成）
 * @returns { hash: 加密结果, salt: 盐值 }
 */
export function sha256WithSalt(
  password: string,
  salt?: string,
): { hash: string; salt: string } {
  // 生成随机盐值（16位）
  const finalSalt = salt || crypto.randomBytes(16).toString('hex');
  // 密码 + 盐值 拼接后加密
  const hash = crypto
    .createHash('sha256')
    .update(password + finalSalt, 'utf8')
    .digest('hex');
  return { hash, salt: salt! };
}

/**
 * 验证 SHA256 加密的密码（带盐值）
 * @param password 原始密码
 * @param hash 已加密的哈希值
 * @param salt 盐值
 * @returns 是否匹配
 */
export function verifySha256Password(
  password: string,
  hash: string,
  salt: string,
): boolean {
  const newHash = sha256(password + salt);
  return newHash === hash;
}

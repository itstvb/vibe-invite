import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('23456789abcdefghjkmnpqrstuvwxyz', 10);

export function generateSlug(): string {
  return nanoid();
}

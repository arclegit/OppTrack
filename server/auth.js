import {
  randomBytes,
  scrypt,
  timingSafeEqual
} from "node:crypto";

import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;


// Hash a password
export async function hashPassword(password) {
  const salt = randomBytes(SALT_LENGTH);

  const derivedKey = await scryptAsync(
    password,
    salt,
    KEY_LENGTH
  );

  return `${salt.toString("hex")}:${Buffer.from(derivedKey).toString("hex")}`;
}


// Verify a password against a stored hash
export async function verifyPassword(
  password,
  storedHash
) {
  const [saltHex, keyHex] = storedHash.split(":");

  if (!saltHex || !keyHex) {
    return false;
  }

  const salt = Buffer.from(
    saltHex,
    "hex"
  );

  const storedKey = Buffer.from(
    keyHex,
    "hex"
  );

  const derivedKey = await scryptAsync(
    password,
    salt,
    storedKey.length
  );

  return timingSafeEqual(
    storedKey,
    Buffer.from(derivedKey)
  );
}
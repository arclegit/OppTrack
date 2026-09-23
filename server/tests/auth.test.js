import test from "node:test";
import assert from "node:assert/strict";

import {
  hashPassword,
  verifyPassword
} from "../auth.js";


// These tests verify the hand-rolled password
// hashing in server/auth.js. It uses Node's
// built-in scrypt (a memory-hard KDF) with a
// random per-password salt and a timing-safe
// comparison, which is a sound alternative to
// bcrypt and requires no extra dependency.


test(
  "hashPassword returns a salt:key hex pair",
  async () => {
    const hash =
      await hashPassword("Password1");

    const [saltHex, keyHex] =
      hash.split(":");

    assert.ok(saltHex, "salt is present");
    assert.ok(keyHex, "key is present");
    assert.equal(saltHex.length, 32);
    assert.equal(keyHex.length, 128);
    assert.match(hash, /^[0-9a-f]+:[0-9a-f]+$/);
  }
);


test(
  "hashPassword never stores the plaintext password",
  async () => {
    const password = "Password1";

    const hash =
      await hashPassword(password);

    assert.ok(
      !hash.includes(password)
    );
  }
);


test(
  "hashPassword uses a random salt per password",
  async () => {
    const first =
      await hashPassword("Password1");

    const second =
      await hashPassword("Password1");

    assert.notEqual(first, second);
  }
);


test(
  "verifyPassword accepts the correct password",
  async () => {
    const hash =
      await hashPassword("Password1");

    assert.equal(
      await verifyPassword(
        "Password1",
        hash
      ),
      true
    );
  }
);


test(
  "verifyPassword rejects a wrong password",
  async () => {
    const hash =
      await hashPassword("Password1");

    assert.equal(
      await verifyPassword(
        "Password2",
        hash
      ),
      false
    );
  }
);


test(
  "verifyPassword rejects malformed hashes",
  async () => {
    assert.equal(
      await verifyPassword(
        "Password1",
        "not-a-hash"
      ),
      false
    );

    assert.equal(
      await verifyPassword(
        "Password1",
        ":"
      ),
      false
    );
  }
);

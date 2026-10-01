require('dotenv').config();

const crypto = require('crypto');
const argon2 = require('argon2');

const {
  getDb,
  initDb
} = require('../db');


async function main() {

  await initDb();

  const db =
    await getDb();


  const existingAdmin =
    await db.get(
      `
      SELECT id
      FROM users
      WHERE username = ?
      `,
      ['admin']
    );


  if (existingAdmin) {

    console.log(
      'Admin account already exists.'
    );

    process.exit(0);
  }


  const password =
    crypto
      .randomBytes(18)
      .toString('base64url');


  const passwordHash =
    await argon2.hash(
      password,
      {
        type: argon2.argon2id,

        memoryCost: 19456,

        timeCost: 2,

        parallelism: 1
      }
    );


  await db.run(
    `
    INSERT INTO users
      (
        username,
        password_hash,
        role
      )

    VALUES
      (?, ?, ?)
    `,

    [
      'admin',
      passwordHash,
      'admin'
    ]
  );


  console.log('');
  console.log(
    '================================'
  );

  console.log(
    'ADMIN ACCOUNT CREATED'
  );

  console.log(
    '================================'
  );

  console.log(
    'Username: admin'
  );

  console.log(
    `Password: ${password}`
  );

  console.log(
    '================================'
  );

  console.log('');
  console.log(
    'Save this password privately.'
  );

  process.exit(0);
}


main().catch(error => {

  console.error(
    'Could not create admin:',
    error
  );

  process.exit(1);
});
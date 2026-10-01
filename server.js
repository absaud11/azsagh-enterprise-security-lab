require('dotenv').config();

const express = require('express');
const path = require('path');

const helmet = require('helmet');

const rateLimit =
  require('express-rate-limit');

const session =
  require('express-session');

const SQLiteStore =
  require('connect-sqlite3')(session);

const argon2 =
  require('argon2');

const {
  getDb,
  initDb
} = require('./db');


const app =
  express();


const PORT =
  process.env.PORT || 3000;


const isProduction =
  process.env.NODE_ENV === 'production';


if (!process.env.SESSION_SECRET) {
  console.error(
    'SESSION_SECRET is missing.'
  );

  process.exit(1);
}


/*
|--------------------------------------------------------------------------
| Reverse proxy
|--------------------------------------------------------------------------
|
| Later Nginx will sit in front of Node.
|
*/

if (isProduction) {
  app.set(
    'trust proxy',
    1
  );
}


/*
|--------------------------------------------------------------------------
| Basic security
|--------------------------------------------------------------------------
*/

app.disable(
  'x-powered-by'
);


app.use(
  helmet()
);


app.use(
  express.json({
    limit: '10kb'
  })
);


app.use(
  express.urlencoded({
    extended: false,
    limit: '10kb'
  })
);


/*
|--------------------------------------------------------------------------
| Session configuration
|--------------------------------------------------------------------------
*/

app.use(
  session({

    store:
      new SQLiteStore({

        db:
          'sessions.sqlite',

        dir:
          path.join(
            __dirname,
            'data'
          )

      }),


    name:
      'azsagh.sid',


    secret:
      process.env.SESSION_SECRET,


    resave:
      false,


    saveUninitialized:
      false,


    rolling:
      true,


    cookie: {

      httpOnly:
        true,

      secure:
        isProduction,

      sameSite:
        'strict',

      maxAge:
        30 * 60 * 1000

    }

  })
);


/*
|--------------------------------------------------------------------------
| Static PUBLIC content
|--------------------------------------------------------------------------
*/

app.use(
  express.static(
    path.join(
      __dirname,
      'public'
    )
  )
);


/*
|--------------------------------------------------------------------------
| Audit logging helper
|--------------------------------------------------------------------------
*/

async function audit(
  req,
  {
    userId = null,
    username = null,
    action,
    success
  }
) {

  try {

    const db =
      await getDb();


    await db.run(
      `
      INSERT INTO audit_logs
        (
          user_id,
          username,
          action,
          success,
          ip_address,
          user_agent
        )

      VALUES
        (?, ?, ?, ?, ?, ?)
      `,

      [
        userId,
        username,
        action,
        success ? 1 : 0,
        req.ip,
        req.get(
          'user-agent'
        ) || null
      ]
    );

  } catch (error) {

    console.error(
      'Audit logging failed:',
      error
    );

  }
}


/*
|--------------------------------------------------------------------------
| Authentication middleware
|--------------------------------------------------------------------------
*/

function requireAuthentication(
  req,
  res,
  next
) {

  if (!req.session.user) {

    return res
      .status(401)
      .json({
        error:
          'Authentication required.'
      });

  }

  next();
}


function requireAdmin(
  req,
  res,
  next
) {

  if (
    !req.session.user ||
    req.session.user.role !== 'admin'
  ) {

    return res
      .status(403)
      .json({
        error:
          'Access denied.'
      });

  }

  next();
}


/*
|--------------------------------------------------------------------------
| Public services API
|--------------------------------------------------------------------------
|
| Notice:
| We are NOT exposing internal ports.
|
*/

app.get(
  '/api/services',

  (req, res) => {

    res.json([
      {
        name:
          'Secure Web Access',

        purpose:
          'Encrypted employee access'
      },

      {
        name:
          'Identity & Authentication',

        purpose:
          'Secure employee sign-in'
      },

      {
        name:
          'Secure File Sharing',

        purpose:
          'Protected company documents'
      },

      {
        name:
          'Real-Time Notifications',

        purpose:
          'Authenticated security and system updates'
      }
    ]);

  }
);


/*
|--------------------------------------------------------------------------
| Login rate limiting
|--------------------------------------------------------------------------
*/

const loginLimiter =
  rateLimit({

    windowMs:
      15 * 60 * 1000,

    limit:
      5,

    standardHeaders:
      true,

    legacyHeaders:
      false,

    message: {
      error:
        'Too many login attempts. Try again later.'
    }

  });


/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/

app.post(
  '/api/login',

  loginLimiter,

  async (req, res) => {

    const {
      username,
      password
    } = req.body;


    if (
      typeof username !== 'string' ||
      typeof password !== 'string'
    ) {

      return res
        .status(400)
        .json({
          error:
            'Invalid request.'
        });

    }


    if (
      username.length < 3 ||
      username.length > 32 ||
      password.length < 8 ||
      password.length > 128
    ) {

      return res
        .status(400)
        .json({
          error:
            'Invalid username or password.'
        });

    }


    const validUsername =
      /^[a-zA-Z0-9._-]+$/;


    if (
      !validUsername.test(
        username
      )
    ) {

      return res
        .status(400)
        .json({
          error:
            'Invalid username or password.'
        });

    }


    try {

      const db =
        await getDb();


      const user =
        await db.get(
          `
          SELECT
            id,
            username,
            password_hash,
            role

          FROM users

          WHERE username = ?
          `,
          [
            username
          ]
        );


      let passwordCorrect =
        false;


      if (user) {

        passwordCorrect =
          await argon2.verify(
            user.password_hash,
            password
          );

      }


      if (
        !user ||
        !passwordCorrect
      ) {

        await audit(
          req,
          {
            username,
            action:
              'LOGIN_FAILED',
            success:
              false
          }
        );


        return res
          .status(401)
          .json({
            error:
              'Invalid username or password.'
          });

      }


      req.session.regenerate(
        async error => {

          if (error) {

            console.error(
              error
            );

            return res
              .status(500)
              .json({
                error:
                  'Login failed.'
              });

          }


          req.session.user = {
            id:
              user.id,

            username:
              user.username,

            role:
              user.role
          };


          await audit(
            req,
            {
              userId:
                user.id,

              username:
                user.username,

              action:
                'LOGIN_SUCCESS',

              success:
                true
            }
          );


          res.json({
            success:
              true,

            user: {
              username:
                user.username,

              role:
                user.role
            }
          });

        }
      );

    } catch (error) {

      console.error(
        error
      );


      res
        .status(500)
        .json({
          error:
            'Server error.'
        });

    }

  }
);


/*
|--------------------------------------------------------------------------
| Check current logged-in user
|--------------------------------------------------------------------------
*/

app.get(
  '/api/me',

  requireAuthentication,

  (req, res) => {

    res.json({
      user:
        req.session.user
    });

  }
);


/*
|--------------------------------------------------------------------------
| Protected employee portal
|--------------------------------------------------------------------------
*/

app.get(
  '/portal',

  (req, res) => {

    if (
      !req.session.user
    ) {

      return res.redirect(
        '/login.html'
      );

    }


    res.sendFile(
      path.join(
        __dirname,
        'private',
        'portal.html'
      )
    );

  }
);


/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/

app.post(
  '/api/logout',

  requireAuthentication,

  async (req, res) => {

    const user =
      req.session.user;


    await audit(
      req,
      {
        userId:
          user.id,

        username:
          user.username,

        action:
          'LOGOUT',

        success:
          true
      }
    );


    req.session.destroy(
      error => {

        if (error) {

          return res
            .status(500)
            .json({
              error:
                'Logout failed.'
            });

        }


        res.clearCookie(
          'azsagh.sid'
        );


        res.json({
          success:
            true
        });

      }
    );

  }
);


/*
|--------------------------------------------------------------------------
| Example admin-only API
|--------------------------------------------------------------------------
*/

app.get(
  '/api/admin/audit',

  requireAdmin,

  async (req, res) => {

    const db =
      await getDb();


    const logs =
      await db.all(
        `
        SELECT
          username,
          action,
          success,
          ip_address,
          created_at

        FROM audit_logs

        ORDER BY id DESC

        LIMIT 50
        `
      );


    res.json(
      logs
    );

  }
);


/*
|--------------------------------------------------------------------------
| 404
|--------------------------------------------------------------------------
*/

app.use(
  (req, res) => {

    res
      .status(404)
      .json({
        error:
          'Not found.'
      });

  }
);


/*
|--------------------------------------------------------------------------
| Start
|--------------------------------------------------------------------------
*/

async function start() {

  await initDb();


  app.listen(
    PORT,
    '127.0.0.1',
    () => {

      console.log('');
      console.log(
        'AZSAGH Secure Enterprise Portal'
      );

      console.log(
        `http://127.0.0.1:${PORT}`
      );

      console.log('');

    }
  );

}


start().catch(
  error => {

    console.error(
      error
    );

    process.exit(1);

  }
);
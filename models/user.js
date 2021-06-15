/** User class for message.ly */
const db = require('../db');
const ExpressError = require('../expressError');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');



/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) {
	  try {
      const hashedPW = bcrypt.hash(password, 12);
      const results = await db.query(`
        INSERT INTO users
        (username, password, first_name, last_name, phone)
        VALUES
        ($1, $2, $3, $4, $5)
        RETURNING username, password, first_name, last_name, phone`,
        [username, hashedPW, first_name, last_name, phone]);
      return results.rows[0];
	  }
	  catch(e) {
      if (e.code === '23505') {
        return next(new ExpressError('Username already exists', 400));
      }
	  }
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const results = await db.query(`
      SELECT username, password FROM users WHERE username = $1`, [username]);
    const user = results.rows[0];
    
    if (user) {
      if (await bcrypt.compare(password, user.password)) {
        return true;
      }
    }

    return false;
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const results = await db.query(`UPDATE users SET last_login_at = current_timestamp WHERE username = $1
      RETURNING username, last_login_at`,
      [username]);
    if (!results.rows.length) return next(new ExpressError('Username not found', 400));

    return results.rows[0];
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    const results = await db.query(`SELECT username, first_name, last_name, phone FROM users`);
    return results.rows;
   }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const results = await db.query(`
      SELECT username, first_name, last_name, phone, join_at, last_login_at
      FROM users
      WHERE username = $1`, [username]);
    if (!results.rows.length) return next(new ExpressError('Username not found', 400));

    return results.rows[0];
   }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const results = await db.query(`
      SELECT m.id,
             m.body,
             m.sent_at,
             m.read_at,
             m.to_username,
             t.first_name,
             t.last_name,
             t.phone
      FROM users AS t
      JOIN messages AS m
      ON t.username = m.from_username
      WHERE m.from_username = $1`, [username]);

      if (!results.rows.length) return next(new ExpressError('Username not found', 400));

      return results.rows.map(obj => ({
        id: obj[m.id],
        to_user: {
          username: obj[m.to_username],
          first_name: obj[t.first_name],
          last_name: obj[t.last_name],
          phone: obj[t.phone]
        },
        body: obj[m.body],
        sent_at: obj[m.sent_at],
        read_at: obj[m.read_at]
      }));
   }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const results = await db.query(`
      SELECT m.id,
             m.body,
             m.sent_at,
             m.read_at,
             m.from_username,
             f.first_name,
             f.last_name,
             f.phone
      FROM users AS f
      JOIN messages AS m
      ON f.username = m.to_username
      WHERE m.to_username = $1`, [username]);

      if (!results.rows.length) return next(new ExpressError('Username not found', 400));

      return results.rows.map(obj => ({
        id: obj[m.id],
        from_user: {
          username: obj[m.from_username],
          first_name: obj[f.first_name],
          last_name: obj[f.last_name],
          phone: obj[f.phone]
        },
        body: obj[m.body],
        sent_at: obj[m.sent_at],
        read_at: obj[m.read_at]
      }));
  }
}


module.exports = User;
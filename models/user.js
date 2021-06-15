/** User class for message.ly */
const db = require('../db');
const ExpressError = require('../expressError');
const bcrypt = require('bcrypt');



/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) {
    try {
      const hashedPW = await bcrypt.hash(password, 12);
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
        return next(new ExpressError('Username already exists', 400))
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
      SELECT id,
             body,
             sent_at,
             read_at,
             to_username,
             first_name,
             last_name,
             phone
      FROM messages
      JOIN users
      ON messages.to_username = users.username
      WHERE messages.from_username = $1`, [username]);

      if (!results.rows.length) return next(new ExpressError('Username not found', 400));

      return results.rows.map(obj => ({
        id: obj.id,
        to_user: {
          username: obj.to_username,
          first_name: obj.first_name,
          last_name: obj.last_name,
          phone: obj.phone
        },
        body: obj.body,
        sent_at: obj.sent_at,
        read_at: obj.read_at
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
      SELECT id,
             body,
             sent_at,
             read_at,
             from_username,
             first_name,
             last_name,
             phone
      FROM users
      JOIN messages
      ON users.username = messages.from_username
      WHERE messages.to_username = $1`, [username]);

      if (!results.rows.length) return next(new ExpressError('Username not found', 400));

      return results.rows.map(obj => ({
        id: obj.id,
        from_user: {
          username: obj.from_username,
          first_name: obj.first_name,
          last_name: obj.last_name,
          phone: obj.phone
        },
        body: obj.body,
        sent_at: obj.sent_at,
        read_at: obj.read_at
      }));
  }
}


module.exports = User;
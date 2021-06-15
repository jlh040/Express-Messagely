const express = require('express');
const User = require('../models/user');
const router = new express.Router();
const ExpressError = require('../expressError');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');

/** POST /login - login: {username, password} => {token}
 **/

router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;
  if (!(username && password)) return next(new ExpressError('Please pass in a username and password', 400));

  if (await User.authenticate(username, password)) {
    const token = jwt.sign({username}, SECRET_KEY)
    await User.updateLoginTimestamp(username);
    return res.json({token});
  }
  else {
    return next(new ExpressError('Invalid username/password', 400));
  }
});




/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post('/register', async (req, res, next) => {
  try {
    const { username, password, first_name, last_name, phone } = req.body;
    if (!(username && password && first_name && last_name && phone)) {
      return next(new ExpressError('Username, password, first_name, last_name, and phone are required!', 400));
    }

    const results = await User.register({username, password, first_name, last_name, phone});
    const token = jwt.sign({username}, SECRET_KEY);
    await User.updateLoginTimestamp(username);
    return res.json({token});
  }
  catch(e) {
    return next(e);
  }
});



module.exports = router;
const express = require('express');
const User = require('../models/user');
const router = new express.Router();
const ExpressError = require('../expressError');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (await User.authenticate(username, password)) {
      const token = jwt.sign({username}, SECREY_KEY)
      return res.json({token});
    }
    else {
      return next(new ExpressError('Invalid username/password', 400));
    }
  }
  catch(e) {
    return next(new ExpressError('Please pass in username and password', 400));
  }
})




/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */



module.exports = router;

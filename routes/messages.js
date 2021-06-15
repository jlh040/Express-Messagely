const express = require('express');
const router = new express.Router();
const db = require('../db');
const Message = require('../models/message');
const { ensureLoggedIn } = require('../middleware/auth');
const ExpressError = require('../expressError');

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

 router.get('/:id', ensureLoggedIn, async (req, res, next) => {
     try {
        const message = await Message.get(req.params.id);
        if (req.user.username == message.from_user.username || req.user.username == message.to_user.username ) {
            return res.json({message});
        }
        else {
            return next(new ExpressError('You must be the sender or recipient to view this', 401));
        }
     }
     catch(e) {
         return next(e);
     }
 })


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

 router.post('/', async (req, res, next) => {
     try {
        const { from_username = req.user.username, to_username, body } = req.body;
        const messageObj = {from_username, to_username, body};
        const message = await Message.create(messageObj);

        return res.json({message});
     }
     catch(e) {
        return next(e);
     }
 })


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that only the intended recipient can mark as read.
 *
 **/

 router.post('/:id/read', async (req, res, next) => {
    try {
        const id = req.params.id;
        const result_ = await db.query(`SELECT to_username FROM messages WHERE id = $1`, [id]);
        if (req.user.username !== result_.rows[0].to_username) {
            throw new ExpressError('Only the recipeient can mark as read', 401);
        }

        const result = await Message.markRead(id);
        return res.json({message: {id, read_at: result.read_at}});
    }
    catch(e) {
        return next(e);
    }
 })

module.exports = router;


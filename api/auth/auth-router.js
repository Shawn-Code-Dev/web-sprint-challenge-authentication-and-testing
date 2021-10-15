const router = require('express').Router();
const {
  validatePayload,
  checkUsernameUnique
} = require('../middleware/registration');
const bcrypt = require('bcryptjs');
const Users = require('../users/users-model')
const tokenBuilder = require('./token-builder')

router.post('/register',
  validatePayload,
  checkUsernameUnique,
  (req, res, next) => {
    const user = req.body

    const rounds = process.env.BCRYPT_ROUNDS || 4
    const hash = bcrypt.hashSync(user.password, rounds)
    
    user.password = hash

    Users.add(user)
      .then(newUser => {
        res.status(201).json(newUser)
      })
      .catch(next)
});

router.post('/login', validatePayload, (req, res, next) => {
  let { username, password } = req.body;
  Users.findBy({ username })
    .then(([user]) => {
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = tokenBuilder(user)
        res.status(200).json({
          message: `welcome, ${username}`,
          token
        })
      } else {
        next({
          status: 401,
          message: 'invalid credentials'
        })
      }
    }) 
    .catch(next)
});

module.exports = router;

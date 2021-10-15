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
          message: `${username} is back!`,
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
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */
});

module.exports = router;

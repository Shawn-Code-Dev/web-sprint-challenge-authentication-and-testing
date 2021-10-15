const userSchema = require("../../schemas/userSchema")
const { findBy } = require("../users/users-model")

const validatePayload = async (req, res, next) => {
  try {
    const validated = await userSchema.validate(req.body)
    req.body = validated
    next()
  } catch (err) {
    next({
      status: 400,
      message: err.message
    })
  }
}

const checkUsernameUnique = async (req, res, next) => {
  try {
    const { username } = req.body
    const taken = await findBy({ username }).first()
    if (!taken) {
      next()
    } else {
      next({
        status: 422,
        message: `username taken`
      })
    }
  } catch (err) {
    next(err)
  }
}

module.exports = {
  validatePayload,
  checkUsernameUnique,
}

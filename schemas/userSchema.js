const yup = require('yup')

const userSchema = yup.object().shape({
  username: yup
    .string()
    .required('username and password required'),
  password: yup
    .string()
    .required('username and password required')
})

module.exports = userSchema

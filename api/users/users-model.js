const db = require('../../data/dbConfig');

function findBy(filter) {
  return db('users').where(filter)
}

function findById(id) {
  return db('users').where({ id }).first()
}

async function add({ username, password }) {
  const [id] = await db('users').insert({ username, password })
  return findById(id)
}

module.exports = {
  findBy,
  findById,
  add,
}

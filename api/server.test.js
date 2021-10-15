const request = require('supertest')
const server = require('./server')
const db = require('../data/dbConfig')
const bcrypt = require('bcryptjs')

beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})
afterAll(async () => {
  await db.destroy()
})

test('sanity', () => {
  expect(true).toBe(true)
})

describe('server.js', () => {
  describe('[POST] /api/auth/register', () => {
    it('[1] creates a new user in the database', async () => {
      await request(server).post('/api/auth/register').send({ username: 'Shawn', password: '1234' })
      const shawn = await db('users').where('username', 'Shawn').first()
      expect(shawn).toMatchObject({ username: 'Shawn' })
    }, 750)
    it('[2] saves the hashed password to database', async () => {
      await request(server).post('/api/auth/register').send({ username: 'Shawn', password: '1234' })
      const shawn = await db('users').where('username', 'Shawn').first()
      expect(bcrypt.compareSync('1234', shawn.password)).toBeTruthy()
    }, 750)
  })

  describe('[POST] /api/auth/login', () => {
    it('[3] successful login responds with correct res', async () => {
      await request(server).post('/api/auth/register').send({ username: 'Shawn', password: '1234' })
      const res = await request(server).post('/api/auth/login').send({ username: 'Shawn', password: '1234' })
      expect(res.body.message).toMatch(/welcome, Shawn/i)
      expect(res.status).toBe(200)
    }, 750)
    it('[4] rejects invalid credentials', async () => {
      await request(server).post('/api/auth/register').send({ username: 'Shawn', password: '1234' })
      const res = await request(server).post('/api/auth/login').send({ username: 'Shawn', password: '4321' })
      expect(res.body.message).toMatch(/invalid credentials/i)
      expect(res.status).toBe(401)
    }, 750)
  })

  describe('[GET] /api/jokes', async () => {
    it('[5] requests without a token are bounced', async () => {
      const res = await request(server).get('/api/jokes')
      expect(res.body.message).toMatch(/token required/i)
    }, 750)
    it('[6] requests with an invalid token are bounced', async () => {
      const res = await request(server).get('/api/jokes').set('Authorization', 'garbage')
      expect(res.body.message).toMatch(/token invalid/i)
    }, 750)
  })
  
})

import request from 'supertest'
import express from 'express'
import { fleets as mockFleets } from '../../mocks/fleets'
import fleetsRouter from '../fleets'
import { CreateFleetData } from '@agentfleet/types'

const app = express()
app.use(express.json())
app.use('/api/fleets', fleetsRouter)

describe('Fleets Router', () => {
  describe('GET /api/fleets', () => {
    it('should return all fleets', async () => {
      const response = await request(app).get('/api/fleets')

      expect(response.status).toBe(200)
      expect(response.body).toEqual(
        mockFleets.map((fleet) => ({
          ...fleet,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }))
      )
    })
  })

  describe('GET /api/fleets/:id', () => {
    it('should return a fleet by id', async () => {
      const fleet = mockFleets[0]
      const response = await request(app).get(`/api/fleets/${fleet.id}`)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        ...fleet,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      })
    })

    it('should return 404 if fleet not found', async () => {
      const response = await request(app).get('/api/fleets/999')
      expect(response.status).toBe(404)
    })
  })

  describe('POST /api/fleets', () => {
    it('should create a new fleet', async () => {
      const newFleet = {
        name: '테스트 Fleet',
        description: '테스트를 위한 Fleet입니다.',
        agents: ['1', '2', '3'],
      }

      const response = await request(app).post('/api/fleets').send(newFleet)

      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: newFleet.name,
        description: newFleet.description,
        agents: newFleet.agents,
        status: 'active',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      })
    })

    it('should create a fleet with empty agents array if agents not provided', async () => {
      const newFleet: CreateFleetData = {
        name: '테스트 Fleet 2',
        description: '테스트를 위한 Fleet입니다.',
      }

      const response = await request(app)
        .post('/api/fleets')
        .send(newFleet)
        .set('Content-Type', 'application/json')

      expect(response.status).toBe(201)
      expect(response.body.agents).toEqual([])
    })
  })

  describe('PUT /api/fleets/:id', () => {
    it('should update an existing fleet', async () => {
      const fleet = mockFleets[0]
      const updateData = {
        name: '수정된 Fleet',
        description: '수정된 설명입니다.',
      }

      const response = await request(app)
        .put(`/api/fleets/${fleet.id}`)
        .send(updateData)

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        ...fleet,
        ...updateData,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      })
    })

    it('should return 404 if fleet not found', async () => {
      const response = await request(app)
        .put('/api/fleets/999')
        .send({ name: '수정된 Fleet' })

      expect(response.status).toBe(404)
    })
  })

  describe('DELETE /api/fleets/:id', () => {
    it('should delete a fleet', async () => {
      const fleet = mockFleets[0]
      const response = await request(app).delete(`/api/fleets/${fleet.id}`)

      expect(response.status).toBe(204)
    })

    it('should return 404 if fleet not found', async () => {
      const response = await request(app).delete('/api/fleets/999')
      expect(response.status).toBe(404)
    })
  })
})

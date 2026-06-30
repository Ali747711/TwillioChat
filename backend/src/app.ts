import cors from 'cors'
import express from 'express'
import type { TwilioConfig } from './config'
import { createVideoToken } from './twilio'

export function createApp(config: TwilioConfig) {
  const app = express()
  app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }))
  app.use(express.json())

  app.post('/api/token', (req, res) => {
    const { identity, room } = req.body ?? {}
    const validIdentity = typeof identity === 'string' && identity.trim() !== ''
    const validRoom = typeof room === 'string' && room.trim() !== ''
    if (!validIdentity || !validRoom) {
      res.status(400).json({ error: 'identity and room are required' })
      return
    }
    const token = createVideoToken(config, identity.trim(), room.trim())
    res.json({ token })
  })

  return app
}

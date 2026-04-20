import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import webhookRouter from './routes/webhook.js'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Webhook endpoint for Evolution API
app.use('/webhook', webhookRouter)

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║     WhatsApp Order Backend - Running on port ${PORT}         ║
╠════════════════════════════════════════════════════════════╣
║  Health: http://localhost:${PORT}/health                     ║
║  Webhook: http://localhost:${PORT}/webhook                   ║
╚════════════════════════════════════════════════════════════╝
  `)
})
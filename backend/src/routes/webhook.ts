import { Router } from 'express'
import type { EvolutionWebhookPayload } from '../types/index.js'
import { processMessage } from '../services/order.js'

const router = Router()

// Store conversation history per phone number
const conversationHistory = new Map<string, { role: 'user' | 'assistant'; content: string }[]>()

router.post('/', async (req, res) => {
  try {
    const payload = req.body as EvolutionWebhookPayload

    // Only handle message events
    if (payload.event !== 'messages.upsert') {
      return res.status(200).json({ status: 'ignored' })
    }

    const data = payload.data
    if (!data.key?.remoteJid || data.key.fromMe) {
      return res.status(200).json({ status: 'ignored' })
    }

    // Extract message text
    const messageText = data.message?.conversation
      || data.message?.extendedTextMessage?.text
      || ''

    if (!messageText.trim()) {
      return res.status(200).json({ status: 'ignored' })
    }

    // Extract phone number (remove @s.whatsapp.net if present)
    const phoneNumber = data.key.remoteJid.replace('@s.whatsapp.net', '')
    const customerName = data.pushName

    // Get conversation history for this phone
    const history = conversationHistory.get(phoneNumber) || []

    // Process message
    const { response, shouldCreateOrder } = await processMessage(
      phoneNumber,
      messageText,
      customerName,
      history
    )

    // Add to conversation history
    history.push({ role: 'user', content: messageText })
    history.push({ role: 'assistant', content: response })
    conversationHistory.set(phoneNumber, history.slice(-10)) // Keep last 10 messages

    // Send response via Evolution API
    await sendWhatsAppMessage(phoneNumber, response)

    console.log(`[WhatsApp] ${customerName || phoneNumber}: ${messageText}`)
    console.log(`[Bot] ${response.slice(0, 100)}...`)
    console.log(`[Order] Created: ${shouldCreateOrder}`)

    res.status(200).json({
      status: 'success',
      response,
      orderCreated: shouldCreateOrder
    })
  } catch (error) {
    console.error('[Webhook Error]', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

async function sendWhatsAppMessage(phoneNumber: string, message: string) {
  const evolutionUrl = process.env.EVOLUTION_API_URL
  const evolutionKey = process.env.EVOLUTION_API_KEY
  const instanceName = process.env.EVOLUTION_API_INSTANCE

  if (!evolutionUrl || !evolutionKey || !instanceName) {
    console.warn('[Evolution API] Missing configuration - message not sent')
    return
  }

  try {
    const response = await fetch(`${evolutionUrl}/message/sendText/${instanceName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionKey
      },
      body: JSON.stringify({
        number: `${phoneNumber}@s.whatsapp.net`,
        text: message
      })
    })

    if (!response.ok) {
      console.error('[Evolution API] Failed to send message:', response.status)
    }
  } catch (error) {
    console.error('[Evolution API] Error sending message:', error)
  }
}

export default router
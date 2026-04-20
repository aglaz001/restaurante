import OpenAI from 'openai'
import type { GPTIntent, MenuItem } from '../types/index.js'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const MENU_CONTEXT = `
Você é um atendente de restaurante muito simpático e eficiente.
O cliente está pedindo via WhatsApp.

REGRAS IMPORTANTES:
1. Quando o cliente pedir algo, identifique os itens do cardápio correspondentes
2. Se não tiver certeza do que é, pergunte para confirmar
3. Sempre confirme os itens antes de registrar o pedido
4. Faça sugestões amigáveis (ex: "Posso sugerir uma batata frita com o hambúrguer?")
5. Responda de forma curta e conversacional (máximo 2-3 frases)

CARDÁPIO DO RESTAURANTE:
`

export async function getGPTResponse(
  userMessage: string,
  menuItems: MenuItem[],
  customerName?: string,
  lastAddress?: string,
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[]
): Promise<GPTIntent> {
  const menuList = menuItems
    .map(item => `- ${item.name} (ID: ${item.id}) - R$ ${item.price.toFixed(2)} - ${item.category}`)
    .join('\n')

  const customerContext = customerName
    ? `Cliente: ${customerName}\nÚltimo endereço: ${lastAddress || 'não informado'}`
    : 'Cliente novo - pedir nome e endereço se necessário'

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `${MENU_CONTEXT}${menuList}

CONTEXTO DO CLIENTE:
${customerContext}

Sua resposta DEVE ser um JSON com este formato EXATO:
{
  "intent": "order" | "add_item" | "remove_item" | "confirm" | "cancel" | "greeting" | "menu_query" | "unknown",
  "items": [{ "product_id": "string", "product_name": "string", "quantity": number, "unit_price": number }],
  "message": "sua resposta em português",
  "customer_name": "nome do cliente se mencionado",
  "customer_address": "endereço se mencionado"
}

Se o intent for "order" ou "add_item", você DEVE populate o array items com os produtos identificados.
Se não conseguir identificar o produto, use intent "unknown" e peça mais detalhes.
`
    }
  ]

  // Add conversation history
  if (conversationHistory) {
    messages.push(...conversationHistory)
  }

  messages.push({
    role: 'user',
    content: userMessage
  })

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.7,
      max_tokens: 500
    })

    const content = response.choices[0]?.message?.content?.trim() || '{}'

    // Parse JSON response
    // Handle potential markdown code blocks
    let jsonStr = content
    if (content.startsWith('```json')) {
      jsonStr = content.replace(/```json\n?/, '').replace(/\n?```$/, '')
    } else if (content.startsWith('```')) {
      jsonStr = content.replace(/```\n?/, '').replace(/\n?```$/, '')
    }

    const parsed = JSON.parse(jsonStr) as GPTIntent

    return {
      ...parsed,
      message: parsed.message || 'Algo saiu errado. Pode repetir?'
    }
  } catch (error) {
    console.error('OpenAI error:', error)
    return {
      intent: 'unknown',
      message: 'Desculpe, tive um problema ao processar sua mensagem. Pode tentar novamente?',
      items: []
    }
  }
}
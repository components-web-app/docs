// `nuxt dev` only: on Vercel, /api/chat is the edge function in api/chat.ts.
// Both call the same handler, so the widget can be tested locally
// (set NUXT_CHAT_MOCK=true to stream a canned answer without an API key).
import { chatEnvFrom, handleChatRequest } from '#shared/chat/handler'

export default defineEventHandler(event => handleChatRequest(toWebRequest(event), chatEnvFrom(process.env)))

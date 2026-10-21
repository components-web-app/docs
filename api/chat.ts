// The docs chat assistant (docs #1), as a Vercel edge function. The site itself is
// prerendered; this is the only part that runs per request. `nuxt dev` serves the
// same handler from server/api/chat.ts.
import { chatEnvFrom, handleChatRequest } from '../shared/chat/handler'

export const config = { runtime: 'edge' }

export default function handler(request: Request): Promise<Response> {
  return handleChatRequest(request, chatEnvFrom(process.env))
}

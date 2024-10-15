import { $fetch } from 'ofetch'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  const cmSecurity = config.campaignMonitor
  const listId = '327773dd8a410771ee31db166e8b0f50'
  const Authorization = 'Basic ' + Buffer.from(cmSecurity.apiKey).toString('base64')

  const getResponse = await $fetch(`https://api.createsend.com/api/v3.3/clients/${cmSecurity.clientId}/lists.json`, {
    method: 'GET',
    headers: {
      Authorization
    },
    ignoreResponseError: true
  })
  console.log(getResponse)

  return await $fetch(`https://api.createsend.com/api/v3.3/subscribers/${listId}.json`, {
    method: 'POST',
    body: {
      EmailAddress: body.emailAddress,
      Resubscribe: true,
      ConsentToTrack: 'Yes'
    },
    headers: {
      Authorization
    }
  })
})

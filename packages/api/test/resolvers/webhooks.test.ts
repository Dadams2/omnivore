import { createTestUser, deleteTestUser } from '../db'
import { graphqlRequest, request } from '../util'
import { expect } from 'chai'
import 'mocha'
import { User } from '../../src/entity/user'
import { WebhookEvent } from '../../src/generated/graphql'
import { Webhook } from '../../src/entity/webhook'
import { getRepository } from '../../src/entity/utils'

describe('Webhooks API', () => {
  const username = 'fakeUser'

  let user: User
  let authToken: string
  let webhook: Webhook

  before(async () => {
    // create test user and login
    user = await createTestUser(username)
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    authToken = res.body.authToken

    // create test webhooks
    webhook = await getRepository(Webhook).save({
      url: 'http://localhost:3000/webhooks/test',
      user: { id: user.id },
      eventTypes: [WebhookEvent.PageCreated],
    })
  })

  after(async () => {
    // clean up
    await deleteTestUser(username)
  })

  describe('Set webhook', () => {
    let eventTypes: WebhookEvent[]
    let query: string
    let webhookUrl: string
    let webhookId: string
    let enabled: boolean

    beforeEach(async () => {
      query = `
        mutation {
          setWebhook(
            input: {
              id: "${webhookId}",
              url: "${webhookUrl}",
              eventTypes: [${eventTypes}],
              enabled: ${enabled}
            }
          ) {
            ... on SetWebhookSuccess {
              webhook {
                id
                url
                eventTypes
                enabled
              }
            }
            ... on SetWebhookError {
              errorCodes
            }
          }
        }
      `
    })

    context('when id is not set', () => {
      before(() => {
        webhookId = ''
        webhookUrl = 'https://example.com/webhook'
        eventTypes = [WebhookEvent.HighlightCreated]
        enabled = true
      })

      it('should create a webhook', async () => {
        const res = await graphqlRequest(query, authToken)

        expect(res.body.data.setWebhook.webhook).to.be.an('object')
        expect(res.body.data.setWebhook.webhook.url).to.eql(webhookUrl)
        expect(res.body.data.setWebhook.webhook.eventTypes).to.eql(eventTypes)
        expect(res.body.data.setWebhook.webhook.enabled).to.be.true
      })
    })

    context('when id is there', () => {
      before(() => {
        webhookId = webhook.id
        webhookUrl = 'https://example.com/webhook_2'
        eventTypes = [WebhookEvent.PageCreated]
        enabled = false
      })

      it('should update a webhook', async () => {
        const res = await graphqlRequest(query, authToken)

        expect(res.body.data.setWebhook.webhook).to.be.an('object')
        expect(res.body.data.setWebhook.webhook.url).to.eql(webhookUrl)
        expect(res.body.data.setWebhook.webhook.eventTypes).to.eql(eventTypes)
        expect(res.body.data.setWebhook.webhook.enabled).to.be.false
      })
    })
  })
})

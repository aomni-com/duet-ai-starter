import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'

import { db, usersTable } from './db'
import { CreateUserSchema } from './schemas'

const app = new Hono()
  .basePath('/api')
  .get('/hello', (context) => {
    return context.json({
      status: 'running',
    })
  })
  .get('/users', async (context) => {
    const users = await db.select().from(usersTable)

    return context.json(users)
  })
  .post('/users', zValidator('json', CreateUserSchema), async (context) => {
    const data = context.req.valid('json')

    const user = await db.insert(usersTable).values(data)

    return context.json(user)
  })

export default app

export type AppType = typeof app

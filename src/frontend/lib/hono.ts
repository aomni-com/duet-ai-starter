import { hc } from 'hono/client'

import type { AppType } from '../../backend'

export const hono = hc<AppType>('/')

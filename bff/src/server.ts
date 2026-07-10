import { serve } from "@hono/node-server"

import { createApp } from "./app.js"

const { app, env } = createApp()

serve(
  {
    fetch: app.fetch,
    port: env.port,
  },
  (info) => {
    console.log(`Florecer BFF listening on http://localhost:${info.port}`)
  }
)

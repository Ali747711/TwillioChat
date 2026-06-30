import 'dotenv/config'
import { createApp } from './app'
import { loadConfig } from './config'

// Validate config at startup so misconfiguration fails loudly here,
// not as a vague 500 on the first request.
const config = loadConfig(process.env)
const app = createApp(config)
const port = Number(process.env.PORT ?? 3001)

app.listen(port, () => {
  console.log(`Token server listening on http://localhost:${port}`)
})

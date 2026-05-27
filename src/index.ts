import express from 'express';
import "dotenv/config"

import healthRouter from "./routers/health.router"
import webhookRouter from "./routers/webhook.router"

// config();

const app = express();
app.use(express.json());

app.use('/api/v1/health', healthRouter);
app.use('/api/v1/webhook', webhookRouter);

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`Brew Hook listening on http://localhost:${port}`);
  console.log('POST /webhook/:event_type   ← universal endpoint');
});
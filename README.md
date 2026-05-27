# 🍺 Brew Hook

> **AI powered webhook → Brew email dispatcher**

Brew Hook exposes a single endpoint (`POST /webhook/:event_type`) that accepts **any** raw JSON webhook from **any** platform (Stripe, Supabase, GitHub, Shopify, …), uses an LLM to automatically understand what happened, and dispatches perfectly contextual email drafts via the [Brew SDK](https://docs.brew.new).

No custom parsers. No field mapping config. Zero boilerplate per integration.

---

## Quick Start

### 1. Clone & install

```bash
git clone <repo>
cd brew-hook
npm install
```

### 2. Set your API keys

```bash
cp .env.example .env
# Fill in BREW_API_KEY and GROQ_API_KEY
```

### 3. Start the server

```bash
npm run dev
# or
npm start 
```

Server starts at `http://localhost:3000`.

### 4. Fire a demo webhook

In a **second terminal**:

```bash
npm run demo
npm run demo:stripe
npm run demo:supabase
npm run demo:github
```

---

## curl examples

### Stripe checkout success

```bash
curl -s -X POST http://localhost:3000/api/v1/webhook/stripe_checkout_success \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "checkout.session.completed",
    "data": {
      "object": {
        "customer_email": "jane@example.com",
        "customer_details": { "name": "Jane Doe" },
        "amount_total": 4900,
        "currency": "usd",
        "metadata": { "plan": "Pro" }
      }
    }
  }' | jq .
```

### Supabase user signup

```bash
curl -s -X POST http://localhost:3000/api/v1/webhook/supabase_user_signup \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "INSERT",
    "table": "auth.users",
    "record": {
      "email": "alex@example.com",
      "raw_user_meta_data": { "full_name": "Alex Smith", "provider": "google" }
    }
  }' | jq .
```

### Any arbitrary webhook

The endpoint doesn't care about the schema. Pass anything:

```bash
curl -s -X POST http://localhost:3000/api/v1/webhook/my_custom_event \
  -H 'Content-Type: application/json' \
  -d '{ "user": { "email": "bob@co.com" }, "action": "upgraded_plan", "plan": "Enterprise" }' \
  | jq .
```

---
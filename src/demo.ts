#!/usr/bin/env ts-node

const BASE_URL = process.env.SERVER_URL ?? 'http://localhost:3000/api/v1';

const STRIPE_CHECKOUT_SUCCESS = {
  id: 'evt_1ABC123',
  object: 'event',
  type: 'checkout.session.completed',
  data: {
    object: {
      id: 'cs_test_xyz',
      customer_email: 'jane.doe@example.com',
      customer_details: {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
      },
      amount_total: 4900,
      currency: 'usd',
      payment_status: 'paid',
      metadata: {
        plan: 'Pro',
        billing_cycle: 'monthly',
      },
    },
  },
};

const SUPABASE_USER_SIGNUP = {
  type: 'INSERT',
  table: 'auth.users',
  record: {
    id: 'user_supabase_123',
    email: 'alex.smith@example.com',
    raw_user_meta_data: {
      full_name: 'Alex Smith',
      avatar_url: 'https://github.com/alexsmith.png',
      provider: 'github',
    },
    created_at: new Date().toISOString(),
  },
  schema: 'auth',
};

const GITHUB_STAR = {
  action: 'created',
  starred_at: new Date().toISOString(),
  repository: { full_name: 'acme/brew-hook', stargazers_count: 42 },
  sender: {
    login: 'octocat',
    email: 'octocat@github.com',
    avatar_url: 'https://avatars.githubusercontent.com/u/583231',
  },
};

async function fire(eventType: string, payload: object) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`Firing mock webhook: ${eventType}`);
  console.log(`${'─'.repeat(60)}`);
  console.log('Payload:', JSON.stringify(payload, null, 2));
  console.log(`${'─'.repeat(60)}`);

  const res = await fetch(`${BASE_URL}/webhook/${eventType}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await res.json();
  console.log(`\n Response [${res.status}]:`);
  console.log(JSON.stringify(body, null, 2));
}

async function main() {
  console.log('Brew Hook — Demo Runner');
  console.log(`Server: ${BASE_URL}\n`);

  const scenario = process.argv[2]; // 'stripe' | 'supabase' | 'github' | undefined (all)

  if (!scenario || scenario === 'stripe') {
    await fire('stripe_checkout_success', STRIPE_CHECKOUT_SUCCESS);
  }
  if (!scenario || scenario === 'supabase') {
    await fire('supabase_user_signup', SUPABASE_USER_SIGNUP);
  }
  if (scenario === 'github') {
    await fire('github_star', GITHUB_STAR);
  }

  console.log(`\n${'═'.repeat(60)}`);
}

main().catch((err) => {
  console.error('Demo failed:', err);
  process.exit(1);
});
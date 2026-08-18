## Recommended Connect integration

### A. Account configuration

- Accounts API: `/v2/core/accounts`; no legacy account `type`.
- Dashboard: Express, supplemented by embedded components in Droovo.
- Fee collection: Droovo manages pricing.
- Negative balance liability: Droovo.
- Each transporter account uses `configuration.recipient` with `stripe_transfers` requested on `stripe_balance`. It must not request merchant configuration or `card_payments`.

### B. Charge pattern: separate charges and transfers

Droovo collects the sender's payment, holds the funds until delivery is validated, then transfers the transporter's net remuneration. This supports delivery-gated payouts and keeps payment support, refunds and disputes with Droovo.

### C. Transporter onboarding flow

Use embedded onboarding inside Droovo, with Stripe-hosted verification screens where required. Create the connected account after the transporter opts in, show outstanding requirements, and allow transfers only when the recipient transfer and payout capabilities are active.

### D. Payments dashboard access for transporters

Transporters receive Express Dashboard access through platform-generated login links, while the most common account and payout views remain embedded in Droovo.

### E. Embedded components

- `account_onboarding`
- `notification_banner` (required)
- `account_management`
- `payments`
- `payouts`

### F. Webhook integration

Use signed webhooks as the source of truth for payment, account and transfer state; event-specific handling is implemented with the payment flow.

### G. Onboarding status gating

Before a transfer, retrieve the Accounts v2 account and verify:

- `configuration.recipient.capabilities.stripe_balance.stripe_transfers.status === "active"`
- `configuration.recipient.capabilities.stripe_balance.payouts.status === "active"`

### H. Fee structure

- Droovo commission: 25% of the sender's price.
- `applicationFeeIncludes`: `stripe_fee_estimate`. For separate charges and transfers this is implemented by reducing the transfer, not by setting `application_fee_amount`.
- Transporter net: gross amount minus 25% commission minus the actual card processing fee, reconciled from the charge balance transaction.
- Droovo bears Connect's monthly active-account charge, payout fees and dispute fees.
- Rates vary; validate against [Stripe pricing](https://stripe.com/pricing) and monitor the Connect margin report.

```text
Expéditeur paie 100 %
        │
        ▼
Droovo conserve 25 %
        │
        ├── frais de carte déduits du gain transporteur
        ▼
Transporteur reçoit 75 % moins les frais de carte réels
        (après validation de la livraison)
```

### I. SaaS monetization

No recurring SaaS fee at launch. Droovo earns only the 25% transaction commission.

### J. Implementation plan

1. Store Stripe identifiers and immutable amount snapshots in Supabase.
2. Add authenticated server routes for transporter onboarding and Express access.
3. Add an embedded Checkout Session for the sender and confirm payment only by signed webhook.
4. Gate delivery release, calculate the real card fee, and create one idempotent transfer after validated delivery.
5. Add refund/dispute recovery, audit logs, test-mode end-to-end tests and production readiness checks.

### K. Negative balance liability

Droovo is liable for negative balances. A connected-account balance can become negative when required, and Droovo can reverse transfers to recover disputed or refunded funds.

### L. Risk management

Droovo owns refund and dispute operations. Stripe Radar remains essential because fraudulent payments that pass the controls can reduce Droovo's balance.

### M. Why this fits Droovo

- The sender pays Droovo, which is the business shown to and contacted by the customer for payment issues.
- The transporter's remuneration must remain blocked until delivery is validated.
- The 25% commission and card-fee allocation are represented explicitly in every booking snapshot.
- The design remains inside Droovo while Stripe handles regulated onboarding and card entry.


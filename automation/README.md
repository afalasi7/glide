# Glide WhatsApp automation

This folder holds the first Glide travel-concierge workflow. It accepts trip requests for vacations, business travel, and everyday trips. The agent asks for missing details, drafts a plan, and explains proposed changes. It cannot search live inventory or complete bookings until provider APIs are connected.

## Run locally

The local n8n instance listens only on `127.0.0.1:5678`.

```bash
docker compose -f automation/compose.yaml up -d
```

Open `http://127.0.0.1:5678` and complete the local n8n owner setup yourself. The current machine has the workflows imported and a local Ollama credential already configured. On a fresh install, import both JSON files from this folder and create an **Ollama API** credential with base URL `http://host.docker.internal:11434`; assign it to the **Local Ollama model** node. The workflow uses `llama3.2:3b`. Install it with `ollama pull llama3.2:3b` if needed.

`glide-local-test.json` provides a loopback-only test endpoint. Publish it and send a request:

```bash
curl -X POST http://127.0.0.1:5678/webhook/glide-local-test \
  -H 'Content-Type: application/json' \
  -d '{"sessionId":"demo-1","text":"Plan a business trip from Dubai to Riyadh for two next month."}'
```

The response has an `output` field. Use a different `sessionId` for each conversation. The local webhook is for development and accepts only text. Do not expose it to the internet.

## Connect WhatsApp

`glide-travel-concierge.json` is the WhatsApp workflow. It is imported but remains unpublished until the WhatsApp account and credentials exist. The n8n [WhatsApp Trigger](https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.whatsapptrigger/) receives messages, and the [WhatsApp Business Cloud](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.whatsapp/) node sends the reply.

1. Create a Meta developer account, business portfolio, and Meta business app with WhatsApp. Add a WhatsApp Business phone number.
2. Put the trigger's Meta app ID and app secret into n8n's WhatsApp OAuth2 credential. Put the WhatsApp access token and business account ID into a separate n8n WhatsApp Business Cloud credential. Enter credentials in n8n, never in this repository.
3. Assign both credentials to their nodes. Configure a public HTTPS n8n URL and verify the Meta webhook before publishing the WhatsApp workflow. Meta allows one webhook URL per app, so switching between test and production replaces the registered URL.
4. Send a message from a permitted test number and confirm the execution, reply, session isolation, and error path in n8n before using a production number.

The local Docker service is intentionally bound to loopback. It cannot receive Meta webhooks as configured. The [n8n credential guide](https://docs.n8n.io/integrations/builtin/credentials/whatsapp/) lists the Meta assets and the distinct credentials required for receiving and sending.

## Approval and provider boundary

The current agent has no booking or payment tools. It must not present an estimated price as a quote or a proposed change as confirmed. When provider APIs arrive, connect search, quote, hold, purchase, and change operations behind a server-side approval check. Each purchase or change needs the traveler's approval of that exact option, total price, fees, and terms. The model's text alone is never authorization.

The local workflow uses n8n Simple Memory for a short conversation. This is suitable for a single local n8n process; use durable per-traveler storage before queue mode or production traffic. The 3B local model can be slow and its wording still needs human review. The mobile app and its account system are a later milestone.

# أثر | Athar

Employee portal `/` requires no account. Management `/admin` uses server-side administrator sessions.

Node 24 HTTP backend, SQLite WAL, transactional record and attachment storage. Railway volume must mount `/data`; never remove the volume. Source lives in this repository under `/athar`; Railway rootDirectory is `/athar`.

Required environment: ADMIN_EMAIL, ADMIN_PASSWORD, DATA_DIR=/data, NODE_ENV=production, PORT=3000, GROQ_API_KEY and GROQ_MODEL. Keep secrets in Railway, never in source control. Run `npm test` and `npm start`. Dockerfile deploys Node 24.

The public employee flow is form → review → send → reference. Admin-only APIs handle records, attachments, notes, impact/effort, AI analysis, initiatives, results and publication of approved public stories. AI analyzes submission text only. Analysis jobs persist, resume after restart, and can be retried. Costs are estimates and require review. Rate limiting is per app instance.

Operational care: one replica with the attached volume; configure Railway backups for the volume before broad rollout. Update the admin password in the protected account settings.

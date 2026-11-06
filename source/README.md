# Affordia Health - consultation v1 draft

This directory contains the source for the static website and the proposed consultation API. The repository root contains a matching static export for review. This branch is a draft and **must not be deployed or merged into the live GitHub Pages branch yet**: the real Cloudflare D1 backend, Gmail authorization and delivery, protected administrative workflow, data retention and legal review remain incomplete.

The source uses Next.js static export. From this directory, run `npm ci`, `npm run build`, `node scripts/test-localized-export.mjs` and `node consultation-api/test.mjs`. The local API preview stores test data in memory and mocks Gmail; do not use it for customer data. The API requires a separately configured, reviewed same-origin Worker and database. Do not put credentials into the repository.

See [the Slovak implementation report](consultation-api/SPRAVA.md) and [technical handover](consultation-api/README.md) for verification, blockers, deployment conditions and rollback guidance. The root-level `A` and `CNAME` are retained from the live branch.

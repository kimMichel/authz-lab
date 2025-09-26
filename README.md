# AuthZ Lab (Multi-tenant + Roles) — Node.js

A tiny Node.js lab to **practice authorization (AuthZ)** with **JWT**, **tenant isolation**, and **role-based access control**.  
It ships with two protected endpoints and sample JWTs so you can test **IDOR/BOLA** and **role bypass** quickly.

---

## Features

- ✅ JWT auth (HS256 by default)
- ✅ **Tenant-scoped** access (`tenant_id` claim vs. `resource.tenant_id`)
- ✅ **Role checks** (`billing.viewer`, `billing.admin`)
- ✅ Two protected endpoints:
  - `GET /api/invoices/:id` — viewer/admin can read **own-tenant** invoices
  - `PATCH /api/invoices/:id` — **admin-only** update in **own tenant**
- ✅ In-memory data (T1/T2) to simulate cross-tenant access
- ✅ Token minting script for 3 personas (T1 user, T1 admin, T2 user)

---

## Quick start

```bash
# 1) Install
npm install

# 2) Run server (http://localhost:3000)
npm run start

# 3) Generate sample tokens (copy one to $TOKEN)
npm run token
export TOKEN='<paste one JWT here>'

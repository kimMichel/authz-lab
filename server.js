import express from "express";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());

// ===== Config =====
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-please-change";

// ===== In-memory data (two tenants: T1 and T2) =====
const invoices = {
    "1001": { id: "1001", tenant_id: "T1", amount: 250, status: "PENDING" },
    "1002": { id: "1002", tenant_id: "T1", amount: 125, status: "PENDING" },
    "2002": { id: "2002", tenant_id: "T2", amount: 990, status: "PENDING" }
};

// ===== Helpers =====
function verifyJWT(req, res, next) {
    const auth = req.headers.authorization || "";
    const parts = auth.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }
    try {
        const payload = jwt.verify(parts[1], JWT_SECRET);
        req.user = payload; // { sub, tenant_id, roles: [] }
        next();
    } catch (e) {
        return res.status(401).json({ error: "Invalid token", details: e.message });
    }
}

function requireAnyRole(rolesAllowed) {
    return (req, res, next) => {
        const userRoles = Array.isArray(req.user?.roles) ? req.user.roles : [];
        const ok = userRoles.some(r => rolesAllowed.includes(r));
        if (!ok) return res.status(403).json({ error: "Forbidden (role)" });
        next();
    };
}

function requireRole(role) {
    return requireAnyRole([role]);
}

function loadInvoice(req, res, next) {
    const inv = invoices[req.params.id];
    if (!inv) return res.status(404).json({ error: "Invoice not found" });
    req.invoice = inv;
    next();
}

function requireSameTenant(req, res, next) {
    const userTenant = req.user?.tenant_id;
    if (!userTenant) return res.status(400).json({ error: "Token missing tenant_id claim" });
    if (req.invoice.tenant_id !== userTenant) {
        // Deny cross-tenant by default (don’t leak existence: you can switch to 404 if you prefer)
        return res.status(403).json({ error: "Forbidden (tenant mismatch)" });
    }
    next();
}

// ===== Routes =====

// READ: must be same tenant; viewer OR admin
app.get("/api/invoices/:id",
    verifyJWT,
    loadInvoice,
    requireSameTenant,
    requireAnyRole(["billing.viewer", "billing.admin"]),
    (req, res) => {
        return res.json(req.invoice);
    }
);

// UPDATE: must be same tenant; ONLY admin
app.patch("/api/invoices/:id",
    verifyJWT,
    loadInvoice,
    requireSameTenant,
    requireRole("billing.admin"),
    (req, res) => {
        const { status } = req.body || {};
        if (status) req.invoice.status = status;
        return res.status(200).json({ ok: true, invoice: req.invoice });
    }
);

// Health
app.get("/health", (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`AuthZ lab server running on http://localhost:${PORT}`);
    console.log("Use `npm run token` to mint sample JWTs.");
});

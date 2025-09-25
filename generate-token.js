import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-please-change";

// Helper to print a signed JWT
function mint({ sub, tenant_id, roles }) {
    const payload = {
        sub, tenant_id, roles,
        // keep short-lived in lab
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 // 1h
    };
    return jwt.sign(payload, JWT_SECRET, { algorithm: "HS256" });
}

const tokens = {
    userA_viewer_T1: mint({ sub: "userA", tenant_id: "T1", roles: ["billing.viewer"] }),
    admin_T1: mint({ sub: "adminT1", tenant_id: "T1", roles: ["billing.admin"] }),
    userB_viewer_T2: mint({ sub: "userB", tenant_id: "T2", roles: ["billing.viewer"] })
};

console.log("\n=== Sample JWTs (Authorization: Bearer <token>) ===\n");
for (const [k, v] of Object.entries(tokens)) {
    console.log(`${k}:\n${v}\n`);
}
console.log("Tip: export one token to an env var, e.g., TOKEN='<paste here>'\n");

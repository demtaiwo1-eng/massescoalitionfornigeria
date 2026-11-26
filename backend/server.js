"use strict";
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");
const { randomBytes, createHash, timingSafeEqual } = require("node:crypto");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = Number(process.env.PORT || 10000);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "https://demtaiwo1-eng.github.io";
const SESSION_DAYS = 7;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
  origin(origin, callback) {
    const allowed = [FRONTEND_ORIGIN, "http://localhost:3000", "http://127.0.0.1:3000"];
    if (!origin || allowed.includes(origin)) return callback(null, true);
    return callback(new Error("Origin not allowed"));
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "X-MCN-Setup-Token"]
}));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: "draft-7", legacyHeaders: false }));

const asyncRoute = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const tokenHash = token => createHash("sha256").update(token).digest("hex");
const safeEqual = (a, b) => {
  const left = Buffer.from(String(a || ""));
  const right = Buffer.from(String(b || ""));
  return left.length === right.length && timingSafeEqual(left, right);
};
const cookieOptions = {
  httpOnly: true, secure: true, sameSite: "none", path: "/",
  maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000
};
const publicUser = u => ({ id: u.id, email: u.email, fullName: u.full_name, role: u.role });

app.get("/health", asyncRoute(async (_req, res) => {
  await pool.query("SELECT 1");
  res.json({ ok: true, service: "mcn-newsroom-api", database: "connected" });
}));

app.post("/api/setup/first-admin", asyncRoute(async (req, res) => {
  const setupToken = process.env.MCN_SETUP_TOKEN;
  if (!setupToken || !safeEqual(req.get("x-mcn-setup-token"), setupToken)) {
    return res.status(404).json({ error: "Setup endpoint unavailable" });
  }
  const { email, fullName, password } = req.body || {};
  if (!email || !fullName || typeof password !== "string" || password.length < 14) {
    return res.status(400).json({ error: "Provide email, full name and a password of at least 14 characters." });
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const count = await client.query("SELECT count(*)::int AS count FROM newsroom_users");
    const setup = await client.query("SELECT value FROM system_settings WHERE key = 'first_admin_created' FOR UPDATE");
    if (count.rows[0].count !== 0 || setup.rowCount) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Initial administrator setup has already been completed." });
    }
    const hash = await bcrypt.hash(password, 12);
    const created = await client.query(
      "INSERT INTO newsroom_users(email,full_name,password_hash,role) VALUES($1,$2,$3,'publisher') RETURNING id,email,full_name,role",
      [String(email).trim().toLowerCase(), String(fullName).trim(), hash]
    );
    await client.query("INSERT INTO system_settings(key,value) VALUES('first_admin_created', now()::text)");
    await client.query("INSERT INTO audit_log(actor_id,action,entity_type,details) VALUES($1,'initial_admin_created','user',$2)",
      [created.rows[0].id, JSON.stringify({ email: created.rows[0].email })]);
    await client.query("COMMIT");
    res.status(201).json({ ok: true, user: publicUser(created.rows[0]), message: "Publisher account created. Sign in to continue." });
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally { client.release(); }
}));

app.post("/api/auth/login", asyncRoute(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Email and password are required." });
  const result = await pool.query("SELECT * FROM newsroom_users WHERE email=$1 AND is_active=true", [String(email).trim().toLowerCase()]);
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(String(password), user.password_hash))) {
    return res.status(401).json({ error: "Invalid email or password." });
  }
  const rawToken = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 86400000);
  await pool.query(
    "INSERT INTO newsroom_sessions(user_id,token_hash,expires_at,ip_address,user_agent) VALUES($1,$2,$3,$4,$5)",
    [user.id, tokenHash(rawToken), expires, req.ip, req.get("user-agent") || null]
  );
  await pool.query("UPDATE newsroom_users SET last_login_at=now() WHERE id=$1", [user.id]);
  await pool.query("INSERT INTO audit_log(actor_id,action,entity_type) VALUES($1,'login','session')", [user.id]);
  res.cookie("mcn_session", rawToken, cookieOptions).json({ ok: true, user: publicUser(user) });
}));

const requireAuth = asyncRoute(async (req, res, next) => {
  const token = req.cookies.mcn_session;
  if (!token) return res.status(401).json({ error: "Sign in required." });
  const result = await pool.query(
    "SELECT u.id,u.email,u.full_name,u.role FROM newsroom_sessions s JOIN newsroom_users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.revoked_at IS NULL AND s.expires_at>now() AND u.is_active=true",
    [tokenHash(token)]
  );
  if (!result.rowCount) return res.status(401).json({ error: "Session expired. Please sign in again." });
  req.user = result.rows[0];
  next();
});
const allowRoles = (...roles) => (req, res, next) => roles.includes(req.user.role)
  ? next() : res.status(403).json({ error: "You do not have permission to perform this action." });

app.get("/api/auth/me", requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));
app.post("/api/auth/logout", requireAuth, asyncRoute(async (req, res) => {
  await pool.query("UPDATE newsroom_sessions SET revoked_at=now() WHERE token_hash=$1", [tokenHash(req.cookies.mcn_session)]);
  res.clearCookie("mcn_session", { httpOnly: true, secure: true, sameSite: "none", path: "/" });
  res.json({ ok: true });
}));

app.get("/api/articles", asyncRoute(async (req, res) => {
  const category = req.query.category;
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);
  const values = [limit];
  let where = "status='published' AND published_at<=now()";
  if (category) { values.push(String(category)); where += " AND category=$2"; }
  const rows = await pool.query(
    `SELECT id,slug,title,dek,category,featured_image_url,featured_image_alt,published_at,seo_description FROM articles WHERE ${where} ORDER BY published_at DESC LIMIT $1`,
    values
  );
  res.json({ articles: rows.rows });
}));
app.get("/api/articles/:slug", asyncRoute(async (req, res) => {
  const result = await pool.query(
    "SELECT id,slug,title,dek,body_json,body_text,category,featured_image_url,featured_image_alt,published_at,seo_title,seo_description FROM articles WHERE slug=$1 AND status='published' AND published_at<=now()",
    [req.params.slug]
  );
  if (!result.rowCount) return res.status(404).json({ error: "Article not found." });
  res.json({ article: result.rows[0] });
}));

app.get("/api/newsroom/articles", requireAuth, asyncRoute(async (req, res) => {
  const result = await pool.query(
    "SELECT a.id,a.slug,a.title,a.category,a.status,a.updated_at,a.published_at,u.full_name AS author_name FROM articles a JOIN newsroom_users u ON u.id=a.author_id ORDER BY a.updated_at DESC LIMIT 100"
  );
  res.json({ articles: result.rows });
}));
app.post("/api/newsroom/articles", requireAuth, asyncRoute(async (req, res) => {
  const { title, slug, dek, bodyJson, bodyText, category, featuredImageUrl, featuredImageAlt, seoTitle, seoDescription } = req.body || {};
  const validCategories = ["Politics","Economy","Security","Education","Health","Society"];
  if (!title || !slug || !validCategories.includes(category)) return res.status(400).json({ error: "Title, slug and a valid category are required." });
  const safeSlug = String(slug).toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-|-$/g,"");
  const result = await pool.query(
    "INSERT INTO articles(slug,title,dek,body_json,body_text,category,featured_image_url,featured_image_alt,author_id,seo_title,seo_description) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *",
    [safeSlug,title,dek||null,JSON.stringify(bodyJson||{}),bodyText||"",category,featuredImageUrl||null,featuredImageAlt||null,req.user.id,seoTitle||null,seoDescription||null]
  );
  await pool.query("INSERT INTO audit_log(actor_id,action,entity_type,entity_id) VALUES($1,'article_created','article',$2)",[req.user.id,result.rows[0].id]);
  res.status(201).json({ article: result.rows[0] });
}));
app.patch("/api/newsroom/articles/:id", requireAuth, asyncRoute(async (req, res) => {
  const found = await pool.query("SELECT * FROM articles WHERE id=$1",[req.params.id]);
  if (!found.rowCount) return res.status(404).json({ error: "Article not found." });
  const current = found.rows[0];
  const privileged = ["publisher","managing_editor","news_editor"].includes(req.user.role);
  if (!privileged && current.author_id !== req.user.id) return res.status(403).json({ error: "You can only edit your own articles." });
  if (["published","approved"].includes(current.status) && !privileged) return res.status(403).json({ error: "An editor must make changes to approved or published articles." });
  const b = req.body || {};
  const next = {
    title: b.title ?? current.title, dek: b.dek ?? current.dek,
    body_json: b.bodyJson === undefined ? current.body_json : b.bodyJson,
    body_text: b.bodyText ?? current.body_text, category: b.category ?? current.category,
    featured_image_url: b.featuredImageUrl ?? current.featured_image_url,
    featured_image_alt: b.featuredImageAlt ?? current.featured_image_alt,
    seo_title: b.seoTitle ?? current.seo_title, seo_description: b.seoDescription ?? current.seo_description
  };
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("INSERT INTO article_revisions(article_id,editor_id,snapshot) VALUES($1,$2,$3)",[current.id,req.user.id,JSON.stringify(current)]);
    const updated = await client.query(
      "UPDATE articles SET title=$2,dek=$3,body_json=$4,body_text=$5,category=$6,featured_image_url=$7,featured_image_alt=$8,seo_title=$9,seo_description=$10,updated_at=now(),version=version+1 WHERE id=$1 RETURNING *",
      [current.id,next.title,next.dek,JSON.stringify(next.body_json),next.body_text,next.category,next.featured_image_url,next.featured_image_alt,next.seo_title,next.seo_description]
    );
    await client.query("INSERT INTO audit_log(actor_id,action,entity_type,entity_id) VALUES($1,'article_updated','article',$2)",[req.user.id,current.id]);
    await client.query("COMMIT");
    res.json({ article: updated.rows[0] });
  } catch(e) { await client.query("ROLLBACK"); throw e; } finally { client.release(); }
}));
app.post("/api/newsroom/articles/:id/submit", requireAuth, asyncRoute(async (req,res) => {
  const r = await pool.query("UPDATE articles SET status='submitted',updated_at=now() WHERE id=$1 AND author_id=$2 AND status IN ('draft','changes_requested') RETURNING id",[req.params.id,req.user.id]);
  if (!r.rowCount) return res.status(409).json({error:"Article cannot be submitted in its current state."});
  await pool.query("INSERT INTO editorial_reviews(article_id,reviewer_id,decision,notes) VALUES($1,$2,'submitted',$3)",[req.params.id,req.user.id,req.body?.notes||null]);
  res.json({ok:true,status:"submitted"});
}));
app.post("/api/newsroom/articles/:id/review", requireAuth, allowRoles("publisher","managing_editor","news_editor"), asyncRoute(async (req,res) => {
  const { decision, notes } = req.body || {};
  const transitions = { changes_requested:"changes_requested", approved:"approved", rejected:"archived" };
  if (!transitions[decision]) return res.status(400).json({error:"Decision must be approved, changes_requested or rejected."});
  const r = await pool.query("UPDATE articles SET status=$2,editor_id=$3,updated_at=now() WHERE id=$1 AND status IN ('submitted','in_review','changes_requested') RETURNING id",[req.params.id,transitions[decision],req.user.id]);
  if (!r.rowCount) return res.status(409).json({error:"Article is not awaiting editorial review."});
  await pool.query("INSERT INTO editorial_reviews(article_id,reviewer_id,decision,notes) VALUES($1,$2,$3,$4)",[req.params.id,req.user.id,decision,notes||null]);
  res.json({ok:true,status:transitions[decision]});
}));
app.post("/api/newsroom/articles/:id/publish", requireAuth, allowRoles("publisher","managing_editor"), asyncRoute(async (req,res) => {
  const r = await pool.query("UPDATE articles SET status='published',published_at=now(),updated_at=now() WHERE id=$1 AND status='approved' RETURNING slug",[req.params.id]);
  if (!r.rowCount) return res.status(409).json({error:"Only approved articles can be published."});
  await pool.query("INSERT INTO audit_log(actor_id,action,entity_type,entity_id) VALUES($1,'article_published','article',$2)",[req.user.id,req.params.id]);
  res.json({ok:true,slug:r.rows[0].slug});
}));

app.use((err, _req, res, _next) => {
  console.error("MCN API error:", err.message);
  if (err.code === "23505") return res.status(409).json({error:"That record already exists."});
  res.status(500).json({error:"An unexpected server error occurred."});
});
app.listen(PORT, () => console.log(`MCN newsroom API listening on ${PORT}`));

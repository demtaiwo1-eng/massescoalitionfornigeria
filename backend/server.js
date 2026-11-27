"use strict";
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");
const { randomBytes, createHash, timingSafeEqual } = require("node:crypto");
const rateLimit = require("express-rate-limit");
const cron = require("node-cron");
const multer = require("multer");

const app = express();
const PORT = Number(process.env.PORT || 10000);
const FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGINS || process.env.FRONTEND_ORIGIN || "https://demtaiwo1-eng.github.io,https://www.massescoalitionfornigeria.com,https://massescoalitionfornigeria.com").split(",").map(x => x.trim()).filter(Boolean);
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
    const allowed = [...FRONTEND_ORIGINS, "http://localhost:3000", "http://127.0.0.1:3000"];
    if (!origin || allowed.includes(origin)) return callback(null, true);
    return callback(new Error("Origin not allowed"));
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "X-MCN-Setup-Token", "Authorization"]
}));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
const imageUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 3 * 1024 * 1024 }, fileFilter: (_req,file,cb) => {
  if (["image/jpeg","image/png","image/webp","image/gif"].includes(file.mimetype)) return cb(null,true);
  cb(new Error("Upload a JPG, PNG, WebP or GIF image."));
} });
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

app.get("/api/setup/status", asyncRoute(async (_req,res) => {
  const count=await pool.query("SELECT count(*)::int AS count FROM newsroom_users");
  const setup=await pool.query("SELECT 1 FROM system_settings WHERE key='first_admin_created' LIMIT 1");
  res.json({available:count.rows[0].count===0 && setup.rowCount===0});
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
    await client.query("SELECT pg_advisory_xact_lock(734921105)");
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
  res.cookie("mcn_session", rawToken, cookieOptions).json({ ok: true, user: publicUser(user), token: rawToken });
}));

const requireAuth = asyncRoute(async (req, res, next) => {
  const bearer = req.get("authorization") || "";
  const token = req.cookies.mcn_session || (bearer.startsWith("Bearer ") ? bearer.slice(7) : null);
  if (!token) return res.status(401).json({ error: "Sign in required." });
  req.sessionToken = token;
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
  await pool.query("UPDATE newsroom_sessions SET revoked_at=now() WHERE token_hash=$1", [tokenHash(req.sessionToken)]);
  res.clearCookie("mcn_session", { httpOnly: true, secure: true, sameSite: "none", path: "/" });
  res.json({ ok: true });
}));

app.get("/api/articles", asyncRoute(async (req, res) => {
  const category = req.query.category ? String(req.query.category) : null;
  const q = req.query.q ? String(req.query.q).trim().slice(0,120) : null;
  if (category && !validCategories.includes(category)) return res.status(400).json({ error: "Unknown article category." });
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);
  const page = Math.min(Math.max(Number.parseInt(String(req.query.page || "1"), 10) || 1, 1), 100000);
  const offset = (page - 1) * limit;
  const values = [];
  let where = "status='published' AND access_level='public' AND published_at<=now()";
  if (category) { values.push(category); where += ` AND category=${values.length}`; }
  if (q) { values.push(`%${q}%`); where += ` AND (title ILIKE ${values.length} OR dek ILIKE ${values.length} OR body_text ILIKE ${values.length})`; }
  const count = await pool.query(`SELECT COUNT(*)::int AS total FROM articles WHERE ${where}`, values);
  const total = count.rows[0]?.total || 0;
  const rows = await pool.query(
    `SELECT id,slug,title,dek,category,featured_image_url,featured_image_alt,published_at,seo_description FROM articles WHERE ${where} ORDER BY published_at DESC,id DESC LIMIT ${values.length + 1} OFFSET ${values.length + 2}`,
    [...values, limit, offset]
  );
  res.set("Cache-Control", "public, max-age=30, stale-while-revalidate=120");
  res.json({ articles: rows.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasPrevious: page > 1, hasNext: offset + rows.rows.length < total } });
}));

app.get("/api/articles/:slug", asyncRoute(async (req, res) => {
  const result = await pool.query(
    "SELECT id,slug,title,dek,body_json,body_text,category,featured_image_url,featured_image_alt,published_at,seo_title,seo_description FROM articles WHERE slug=$1 AND status='published' AND access_level='public' AND published_at<=now()",
    [req.params.slug]
  );
  if (!result.rowCount) return res.status(404).json({ error: "Article not found." });
  res.json({ article: result.rows[0] });
}));

app.get("/api/newsroom/articles/:id", requireAuth, asyncRoute(async (req,res) => {
  const r=await pool.query("SELECT * FROM articles WHERE id=$1",[req.params.id]);
  if(!r.rowCount) return res.status(404).json({error:"Article not found."});
  const a=r.rows[0];
  if(!["publisher","managing_editor","news_editor"].includes(req.user.role) && a.author_id!==req.user.id) return res.status(403).json({error:"You cannot view this article draft."});
  res.json({article:a});
}));
app.get("/api/newsroom/articles/:id/revisions", requireAuth, asyncRoute(async (req,res) => {
  const own=await pool.query("SELECT author_id FROM articles WHERE id=$1",[req.params.id]);
  if(!own.rowCount) return res.status(404).json({error:"Article not found."});
  if(!["publisher","managing_editor","news_editor"].includes(req.user.role) && own.rows[0].author_id!==req.user.id) return res.status(403).json({error:"You cannot view this article history."});
  const r=await pool.query("SELECT r.id,r.created_at,u.full_name AS editor_name,r.snapshot->>'title' AS title FROM article_revisions r JOIN newsroom_users u ON u.id=r.editor_id WHERE r.article_id=$1 ORDER BY r.created_at DESC LIMIT 30",[req.params.id]);
  res.json({revisions:r.rows});
}));
app.get("/api/newsroom/articles", requireAuth, asyncRoute(async (req, res) => {
  const privileged = ["publisher","managing_editor","news_editor"].includes(req.user.role);
  const query = privileged
    ? "SELECT a.id,a.slug,a.title,a.category,a.status,a.updated_at,a.published_at,u.full_name AS author_name FROM articles a JOIN newsroom_users u ON u.id=a.author_id ORDER BY a.updated_at DESC LIMIT 100"
    : "SELECT a.id,a.slug,a.title,a.category,a.status,a.updated_at,a.published_at,u.full_name AS author_name FROM articles a JOIN newsroom_users u ON u.id=a.author_id WHERE a.author_id=$1 ORDER BY a.updated_at DESC LIMIT 100";
  const result = await pool.query(query, privileged ? [] : [req.user.id]);
  res.json({ articles: result.rows });
}));
app.post("/api/newsroom/articles", requireAuth, asyncRoute(async (req, res) => {
  const { title, slug, dek, bodyJson, bodyText, category, featuredImageUrl, featuredImageAlt, seoTitle, seoDescription, accessLevel } = req.body || {};
  const validCategories = ["Politics","Economy","Security","Education","Health","Society"];
  if (!title || !slug || !validCategories.includes(category)) return res.status(400).json({ error: "Title, slug and a valid category are required." });
  const safeSlug = String(slug).toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-|-$/g,"");
  const result = await pool.query(
    "INSERT INTO articles(slug,title,dek,body_json,body_text,category,featured_image_url,featured_image_alt,author_id,seo_title,seo_description,access_level) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *",
    [safeSlug,title,dek||null,JSON.stringify(bodyJson||{}),bodyText||"",category,featuredImageUrl||null,featuredImageAlt||null,req.user.id,seoTitle||null,seoDescription||null,accessLevel==="advanced" && ["publisher","managing_editor"].includes(req.user.role) ? "advanced" : "public"]
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
  if (!privileged && !["draft","changes_requested"].includes(current.status)) return res.status(403).json({ error: "Only drafts or articles returned for changes can be edited by their author." });
  const b = req.body || {};
  const next = {
    title: b.title ?? current.title, dek: b.dek ?? current.dek,
    body_json: b.bodyJson === undefined ? current.body_json : b.bodyJson,
    body_text: b.bodyText ?? current.body_text, category: b.category ?? current.category,
    featured_image_url: b.featuredImageUrl ?? current.featured_image_url,
    featured_image_alt: b.featuredImageAlt ?? current.featured_image_alt,
    seo_title: b.seoTitle ?? current.seo_title, seo_description: b.seoDescription ?? current.seo_description,
    access_level: b.accessLevel === "advanced" && ["publisher","managing_editor"].includes(req.user.role) ? "advanced" : current.access_level
  };
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("INSERT INTO article_revisions(article_id,editor_id,snapshot) VALUES($1,$2,$3)",[current.id,req.user.id,JSON.stringify(current)]);
    const updated = await client.query(
      "UPDATE articles SET title=$2,dek=$3,body_json=$4,body_text=$5,category=$6,featured_image_url=$7,featured_image_alt=$8,seo_title=$9,seo_description=$10,access_level=$11,updated_at=now(),version=version+1 WHERE id=$1 RETURNING *",
      [current.id,next.title,next.dek,JSON.stringify(next.body_json),next.body_text,next.category,next.featured_image_url,next.featured_image_alt,next.seo_title,next.seo_description,next.access_level]
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
app.post("/api/newsroom/articles/:id/schedule", requireAuth, allowRoles("publisher","managing_editor"), asyncRoute(async (req,res) => {
  const when=new Date(req.body?.scheduledAt);
  if(Number.isNaN(when.getTime()) || when.getTime()<=Date.now()) return res.status(400).json({error:"Choose a valid future publication time."});
  const r=await pool.query("UPDATE articles SET status='scheduled',scheduled_at=$2,updated_at=now() WHERE id=$1 AND status='approved' RETURNING id,scheduled_at",[req.params.id,when]);
  if(!r.rowCount) return res.status(409).json({error:"Only approved articles can be scheduled."});
  await pool.query("INSERT INTO audit_log(actor_id,action,entity_type,entity_id) VALUES($1,'article_scheduled','article',$2)",[req.user.id,req.params.id]);
  res.json({ok:true,scheduledAt:r.rows[0].scheduled_at});
}));
app.post("/api/newsroom/articles/:id/publish", requireAuth, allowRoles("publisher","managing_editor"), asyncRoute(async (req,res) => {
  const r = await pool.query("UPDATE articles SET status='published',published_at=now(),updated_at=now() WHERE id=$1 AND status='approved' RETURNING slug",[req.params.id]);
  if (!r.rowCount) return res.status(409).json({error:"Only approved articles can be published."});
  await pool.query("INSERT INTO audit_log(actor_id,action,entity_type,entity_id) VALUES($1,'article_published','article',$2)",[req.user.id,req.params.id]);
  res.json({ok:true,slug:r.rows[0].slug});
}));


const validCategories = ["Politics","Economy","Security","Education","Health","Society"];
const validRoles = ["publisher","managing_editor","news_editor","reporter","contributor"];

const contactLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 5, standardHeaders: "draft-7", legacyHeaders: false });
app.post("/api/contact", contactLimiter, asyncRoute(async (req,res) => {
  const { name,email,subject,message,website } = req.body || {};
  if (website) return res.status(200).json({ok:true});
  if (![name,email,subject,message].every(v => typeof v === "string" && v.trim())) return res.status(400).json({error:"Please complete every field."});
  if (name.length>120 || email.length>254 || subject.length>180 || message.length>5000) return res.status(400).json({error:"One or more fields are too long."});
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({error:"Enter a valid email address."});
  await pool.query("INSERT INTO contact_messages(name,email,subject,message) VALUES($1,$2,$3,$4)",[name.trim(),email.trim().toLowerCase(),subject.trim(),message.trim()]);
  res.status(201).json({ok:true,message:"Your message has been delivered to the newsroom inbox."});
}));

app.get("/api/newsroom/messages", requireAuth, allowRoles("publisher","managing_editor","news_editor"), asyncRoute(async (_req,res) => {
  const r = await pool.query("SELECT id,name,email,subject,message,status,created_at,read_at FROM contact_messages ORDER BY created_at DESC LIMIT 100");
  res.json({messages:r.rows});
}));
app.patch("/api/newsroom/messages/:id", requireAuth, allowRoles("publisher","managing_editor","news_editor"), asyncRoute(async (req,res) => {
  const status = req.body?.status;
  if (!["read","replied","archived"].includes(status)) return res.status(400).json({error:"Invalid message status."});
  const r = await pool.query("UPDATE contact_messages SET status=$2,read_at=CASE WHEN $2='read' THEN COALESCE(read_at,now()) ELSE read_at END WHERE id=$1 RETURNING id,status",[req.params.id,status]);
  if (!r.rowCount) return res.status(404).json({error:"Message not found."});
  await pool.query("INSERT INTO audit_log(actor_id,action,entity_type,entity_id) VALUES($1,'contact_message_updated','contact_message',$2)",[req.user.id,req.params.id]);
  res.json({message:r.rows[0]});
}));

app.get("/api/newsroom/users", requireAuth, allowRoles("publisher"), asyncRoute(async (_req,res) => {
  const r = await pool.query("SELECT id,email,full_name,role,is_active,created_at,last_login_at FROM newsroom_users ORDER BY created_at ASC");
  res.json({users:r.rows});
}));
app.post("/api/newsroom/users", requireAuth, allowRoles("publisher"), asyncRoute(async (req,res) => {
  const {email,fullName,password,role} = req.body || {};
  if (!email || !fullName || typeof password!=="string" || password.length<14 || !validRoles.includes(role) || role==="publisher") {
    return res.status(400).json({error:"Provide a valid staff email, full name, role and a password of at least 14 characters. Publisher access is not assignable here."});
  }
  const hash = await bcrypt.hash(password,12);
  const r = await pool.query("INSERT INTO newsroom_users(email,full_name,password_hash,role) VALUES($1,$2,$3,$4) RETURNING id,email,full_name,role,is_active,created_at",[String(email).trim().toLowerCase(),String(fullName).trim(),hash,role]);
  await pool.query("INSERT INTO audit_log(actor_id,action,entity_type,entity_id,details) VALUES($1,'staff_account_created','user',$2,$3)",[req.user.id,r.rows[0].id,JSON.stringify({email:r.rows[0].email,role})]);
  res.status(201).json({user:r.rows[0]});
}));
app.patch("/api/newsroom/users/:id", requireAuth, allowRoles("publisher"), asyncRoute(async (req,res) => {
  if (req.params.id===req.user.id) return res.status(400).json({error:"You cannot change your own role or access here."});
  const {role,isActive} = req.body || {};
  if (role!==undefined && (!validRoles.includes(role) || role==="publisher")) return res.status(400).json({error:"Publisher is reserved for the first owner account. Choose another newsroom role."});
  const r = await pool.query("UPDATE newsroom_users SET role=COALESCE($2,role),is_active=COALESCE($3,is_active),updated_at=now() WHERE id=$1 RETURNING id,email,full_name,role,is_active",[req.params.id,role??null,isActive??null]);
  if (!r.rowCount) return res.status(404).json({error:"Staff account not found."});
  await pool.query("INSERT INTO audit_log(actor_id,action,entity_type,entity_id) VALUES($1,'staff_account_updated','user',$2)",[req.user.id,req.params.id]);
  res.json({user:r.rows[0]});
}));

app.get("/api/newsroom/access-pins", requireAuth, allowRoles("publisher"), asyncRoute(async (_req,res) => {
  const r = await pool.query("SELECT id,customer_email,access_level,expires_at,max_uses,uses,revoked_at,created_at FROM advanced_access_pins ORDER BY created_at DESC LIMIT 100");
  res.json({pins:r.rows});
}));
app.post("/api/newsroom/access-pins", requireAuth, allowRoles("publisher"), asyncRoute(async (req,res) => {
  const email=String(req.body?.email||"").trim().toLowerCase();
  const days=Math.min(Math.max(Number(req.body?.expiresInDays)||30,1),365);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({error:"Enter a valid customer email."});
  const pin=randomBytes(8).toString("hex").toUpperCase().match(/.{1,4}/g).join("-");
  const expiresAt=new Date(Date.now()+days*86400000);
  const r=await pool.query("INSERT INTO advanced_access_pins(pin_hash,customer_email,access_level,expires_at,max_uses,issued_by) VALUES($1,$2,'advanced',$3,1,$4) RETURNING id,customer_email,access_level,expires_at,created_at",[tokenHash(pin),email,expiresAt,req.user.id]);
  await pool.query("INSERT INTO audit_log(actor_id,action,entity_type,entity_id,details) VALUES($1,'access_pin_issued','access_pin',$2,$3)",[req.user.id,r.rows[0].id,JSON.stringify({email,expiresAt})]);
  res.status(201).json({pin,record:r.rows[0],message:"Copy this PIN now. It is shown only once and is bound to the supplied email."});
}));
app.post("/api/newsroom/access-pins/:id/revoke", requireAuth, allowRoles("publisher"), asyncRoute(async (req,res) => {
  const r=await pool.query("UPDATE advanced_access_pins SET revoked_at=now() WHERE id=$1 AND revoked_at IS NULL RETURNING id",[req.params.id]);
  if(!r.rowCount) return res.status(404).json({error:"Active PIN not found."});
  await pool.query("UPDATE advanced_access_sessions SET revoked_at=now() WHERE pin_id=$1 AND revoked_at IS NULL",[req.params.id]);
  await pool.query("INSERT INTO audit_log(actor_id,action,entity_type,entity_id) VALUES($1,'access_pin_revoked','access_pin',$2)",[req.user.id,req.params.id]);
  res.json({ok:true});
}));
app.get("/api/advanced/articles", asyncRoute(async (req,res) => {
  const bearer=req.get("authorization")||"";
  const token=bearer.startsWith("Bearer ")?bearer.slice(7):"";
  if(!token) return res.status(401).json({error:"Activate an advanced-access PIN first."});
  const access=await pool.query("SELECT user_email FROM advanced_access_sessions WHERE token_hash=$1 AND revoked_at IS NULL AND expires_at>now()",[tokenHash(token)]);
  if(!access.rowCount) return res.status(401).json({error:"Advanced access has expired or is invalid."});
  const rows=await pool.query("SELECT id,slug,title,dek,category,featured_image_url,featured_image_alt,published_at FROM articles WHERE status='published' AND access_level='advanced' AND published_at<=now() ORDER BY published_at DESC LIMIT 50");
  res.json({email:access.rows[0].user_email,articles:rows.rows});
}));
app.get("/api/advanced/articles/:slug", asyncRoute(async (req,res) => {
  const bearer=req.get("authorization")||"";
  const token=bearer.startsWith("Bearer ")?bearer.slice(7):"";
  if(!token) return res.status(401).json({error:"Activate an advanced-access PIN first."});
  const access=await pool.query("SELECT user_email FROM advanced_access_sessions WHERE token_hash=$1 AND revoked_at IS NULL AND expires_at>now()",[tokenHash(token)]);
  if(!access.rowCount) return res.status(401).json({error:"Advanced access has expired or is invalid."});
  const r=await pool.query("SELECT id,slug,title,dek,body_text,category,featured_image_url,featured_image_alt,published_at,seo_title,seo_description FROM articles WHERE slug=$1 AND status='published' AND access_level='advanced' AND published_at<=now()",[req.params.slug]);
  if(!r.rowCount) return res.status(404).json({error:"Advanced article not found."});
  res.json({article:r.rows[0]});
}));
app.post("/api/access/activate", rateLimit({windowMs:15*60*1000,limit:10,standardHeaders:"draft-7",legacyHeaders:false}), asyncRoute(async (req,res) => {
  const email=String(req.body?.email||"").trim().toLowerCase();
  const pin=String(req.body?.pin||"").trim().toUpperCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!/^[A-F0-9]{4}(?:-[A-F0-9]{4}){3}$/.test(pin)) return res.status(400).json({error:"Enter the email address the PIN was issued to and the complete PIN."});
  const client=await pool.connect();
  try{
    await client.query("BEGIN");
    const found=await client.query("SELECT id,customer_email,access_level,expires_at,max_uses,uses,revoked_at FROM advanced_access_pins WHERE pin_hash=$1 FOR UPDATE",[tokenHash(pin)]);
    const p=found.rows[0];
    if(!p||p.customer_email!==email||p.revoked_at||p.uses>=p.max_uses||(p.expires_at&&new Date(p.expires_at)<=new Date())){
      await client.query("ROLLBACK");return res.status(400).json({error:"This PIN is invalid, expired, revoked or already used."});
    }
    await client.query("UPDATE advanced_access_pins SET uses=uses+1 WHERE id=$1",[p.id]);
    await client.query("INSERT INTO access_activations(pin_id,user_email) VALUES($1,$2)",[p.id,email]);
    const accessToken=randomBytes(32).toString("base64url");
    const expiresAt=new Date(Date.now()+7*86400000);
    await client.query("INSERT INTO advanced_access_sessions(token_hash,user_email,access_level,expires_at,pin_id) VALUES($1,$2,$3,$4,$5)",[tokenHash(accessToken),email,p.access_level,expiresAt,p.id]);
    await client.query("COMMIT");
    res.json({ok:true,accessLevel:p.access_level,activatedAt:new Date().toISOString(),expiresAt,email,accessToken});
  }catch(e){await client.query("ROLLBACK");throw e;}finally{client.release();}
}));

app.post("/api/newsroom/media", requireAuth, imageUpload.single("image"), asyncRoute(async (req,res) => {
  if(!req.file) return res.status(400).json({error:"Choose an image to upload."});
  const b=req.file.buffer;
  const ok=(req.file.mimetype==="image/jpeg" && b[0]===255 && b[1]===216 && b[2]===255) || (req.file.mimetype==="image/png" && b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) || (req.file.mimetype==="image/webp" && b.toString("ascii",0,4)==="RIFF" && b.toString("ascii",8,12)==="WEBP");
  if(!ok) return res.status(400).json({error:"The uploaded file does not match its image type."});
  const alt=String(req.body?.altText||"").trim().slice(0,300);
  const r=await pool.query("INSERT INTO newsroom_media(file_name,mime_type,byte_size,alt_text,data,uploaded_by) VALUES($1,$2,$3,$4,$5,$6) RETURNING id,file_name,mime_type,byte_size,alt_text,created_at",[req.file.originalname.slice(0,180),req.file.mimetype,req.file.size,alt,b,req.user.id]);
  res.status(201).json({media:{...r.rows[0],url:"/api/media/"+r.rows[0].id}});
}));
app.get("/api/media/:id", asyncRoute(async (req,res) => {
  const r=await pool.query("SELECT mime_type,data FROM newsroom_media WHERE id=$1",[req.params.id]);
  if(!r.rowCount) return res.status(404).end();
  res.set("Content-Type",r.rows[0].mime_type).set("Cache-Control","public, max-age=31536000, immutable").set("X-Content-Type-Options","nosniff").send(r.rows[0].data);
}));
app.use((err, _req, res, _next) => {
  if(err instanceof multer.MulterError) return res.status(400).json({error:err.code==="LIMIT_FILE_SIZE"?"Image must be 3 MB or smaller.":err.message});
  console.error("MCN API error:", err.message);
  if (err.code === "23505") return res.status(409).json({error:"That record already exists."});
  res.status(500).json({error:"An unexpected server error occurred."});
});
cron.schedule("* * * * *", async () => { try { await pool.query("UPDATE articles SET status='published',published_at=scheduled_at,updated_at=now() WHERE status='scheduled' AND scheduled_at<=now()"); } catch(e) { console.error("Scheduled publication failed:",e.message); } });
app.listen(PORT, () => console.log(`MCN newsroom API listening on ${PORT}`));

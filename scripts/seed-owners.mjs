import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i === -1) continue;
    const key = trimmed.slice(0, i).trim();
    const value = trimmed.slice(i + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const MASTER_ADMIN_ID = "33b94b3b-6916-4bc6-8aea-029592a30af8";

const owners = [
  {
    full_name: "أحمد المنصوري",
    email: "ahmed.mansouri.seed@example.com",
    phone: "+971501112233",
    national_id: "784199012345671",
    city: "دبي",
    company_name: "المنصوري للعقارات",
    valid_until: "2027-06-30",
    account_status: "active",
    notes: "مالك تجريبي — دبي",
  },
  {
    full_name: "فاطمة الشامسي",
    email: "fatima.shamsi.seed@example.com",
    phone: "+971502223344",
    national_id: "784199112345672",
    city: "أبوظبي",
    company_name: "شامسي هومز",
    valid_until: "2026-12-31",
    account_status: "active",
    notes: "مالك تجريبي — أبوظبي",
  },
  {
    full_name: "خالد العتيبي",
    email: "khaled.otaibi.seed@example.com",
    phone: "+971503334455",
    national_id: "784199212345673",
    city: "الشارقة",
    company_name: "العتيبي إنفست",
    valid_until: "2025-01-15",
    account_status: "pending",
    notes: "صلاحية منتهية — pending",
  },
  {
    full_name: "نورة الهاشمي",
    email: "noura.hashimi.seed@example.com",
    phone: "+971504445566",
    national_id: "784199312345674",
    city: "عجمان",
    company_name: "هاشمي ريزيدنس",
    valid_until: "2027-03-01",
    account_status: "active",
    notes: null,
  },
  {
    full_name: "سعيد البلوشي",
    email: "saeed.balushi.seed@example.com",
    phone: "+971505556677",
    national_id: "784199412345675",
    city: "رأس الخيمة",
    company_name: "البلوشي بروبرتي",
    valid_until: "2026-09-20",
    account_status: "inactive",
    notes: "معطّل مؤقتاً للتجربة",
  },
  {
    full_name: "مريم الكعبي",
    email: "mariam.kaabi.seed@example.com",
    phone: "+971506667788",
    national_id: "784199512345676",
    city: "الفجيرة",
    company_name: "الكعبي للإدارة",
    valid_until: "2028-01-01",
    account_status: "active",
    notes: null,
  },
  {
    full_name: "يوسف القايدي",
    email: "yousef.qaidi.seed@example.com",
    phone: "+971507778899",
    national_id: "784199612345677",
    city: "دبي",
    company_name: "قايدي تاورز",
    valid_until: "2027-11-11",
    account_status: "active",
    notes: "محفظة كبيرة",
  },
  {
    full_name: "ليلى المزروعي",
    email: "layla.mazrouei.seed@example.com",
    phone: "+971508889900",
    national_id: "784199712345678",
    city: "أبوظبي",
    company_name: "مزروعي ليفينغ",
    valid_until: "2024-12-01",
    account_status: "pending",
    notes: "صلاحية قديمة",
  },
  {
    full_name: "حسن الجابري",
    email: "hassan.jaberi.seed@example.com",
    phone: "+971509990011",
    national_id: "784199812345679",
    city: "الشارقة",
    company_name: null,
    valid_until: "2026-08-15",
    account_status: "active",
    notes: "فرد بدون شركة",
  },
  {
    full_name: "هند السويدي",
    email: "hind.suwaidi.seed@example.com",
    phone: "+971501234567",
    national_id: "784199912345680",
    city: "دبي",
    company_name: "السويدي العقارية",
    valid_until: "2027-05-05",
    account_status: "active",
    notes: "بيانات بذرية للتجربة",
  },
];

async function fetchBytes(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed fetch ${url}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") || "image/jpeg";
  return { buf, contentType };
}

async function uploadImage(userId, kind, sourceUrl) {
  const { buf, contentType } = await fetchBytes(sourceUrl);
  const ext = contentType.includes("png") ? "png" : "jpg";
  const path = `${userId}/${kind}.${ext}`;

  const { error } = await admin.storage.from("avatars").upload(path, buf, {
    upsert: true,
    contentType,
  });
  if (error) throw error;

  const {
    data: { publicUrl },
  } = admin.storage.from("avatars").getPublicUrl(path);
  return `${publicUrl}?v=${Date.now()}`;
}

async function ensureBucket() {
  const { data: buckets } = await admin.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === "avatars");
  if (!exists) {
    const { error } = await admin.storage.createBucket("avatars", {
      public: true,
      fileSizeLimit: 2 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    });
    if (error) throw error;
    console.log("Created avatars bucket");
  }
}

async function seedOne(owner, index) {
  const password = `SeedPass${index + 1}!x9`;
  const is_active = owner.account_status === "active";

  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email: owner.email,
      password,
      email_confirm: true,
      ban_duration: is_active ? "none" : "876000h",
    });

  if (createError || !created.user) {
    if (createError?.message?.includes("already been registered")) {
      console.log(`skip (exists): ${owner.email}`);
      return { skipped: true };
    }
    throw createError || new Error("createUser failed");
  }

  const userId = created.user.id;
  const seed = index + 21;

  const avatar_url = await uploadImage(
    userId,
    "avatar",
    `https://i.pravatar.cc/400?img=${seed}`,
  );
  const id_document_url = await uploadImage(
    userId,
    "id-document",
    `https://picsum.photos/seed/mandera-doc-${seed}/800/500`,
  );

  const { error: profileError } = await admin.from("users").insert({
    id: userId,
    role: "owner",
    full_name: owner.full_name,
    email: owner.email,
    phone: owner.phone,
    national_id: owner.national_id,
    valid_until: owner.valid_until,
    account_status: owner.account_status,
    is_active,
    company_name: owner.company_name,
    city: owner.city,
    notes: owner.notes,
    avatar_url,
    id_document_url,
    created_by: MASTER_ADMIN_ID,
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(userId);
    throw profileError;
  }

  console.log(`✓ ${owner.full_name} (${owner.account_status}) — ${owner.email}`);
  return { email: owner.email, password, status: owner.account_status };
}

async function main() {
  await ensureBucket();
  const results = [];
  for (let i = 0; i < owners.length; i++) {
    try {
      const r = await seedOne(owners[i], i);
      results.push(r);
    } catch (e) {
      console.error(`✗ ${owners[i].email}:`, e.message || e);
    }
  }
  console.log("\nDone. Created/skipped:", results.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

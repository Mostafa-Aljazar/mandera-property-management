# Mandera Properties Management — Project Brief for Claude Code

هاد الملف ملخص كامل لمشروع "Mandera Properties Management" — استخدمه كنقطة انطلاق مع Claude Code لبدء الإعداد المحلي. كل القرارات المعمارية محسومة مسبقاً، الـ Database جاهزة وشغالة فعلياً على Supabase.

---

## 1. نظرة عامة على المشروع

نظام لإدارة العقارات المؤجرة، بيتكون من:
- **Next.js app واحد** بيخدم **واجهة الويب لـ Master Admin فقط** (صفحات + API routes).
- **REST API endpoints** (جزء من نفس مشروع Next.js، عبر Route Handlers) لدور **Property Owner** — هاي الـ endpoints بيستهلكها تطبيق **Flutter** منفصل يبنيه مبرمج موبايل آخر.
- **Tenant (المستأجر)** ما إله أي وصول للنظام إطلاقاً — مجرد سجل بيانات يديره الـ Owner.

### الأدوار
1. **Master Admin**: يدير حسابات أصحاب العقارات (Owners) — إضافة، تفعيل/تعطيل، حذف (soft delete). له رؤية **إحصائية فقط** (أعداد) على بيانات كل Owner، بدون دخول على تفاصيل عقودهم/دفعاتهم.
2. **Property Owner**: يدير عقاراته، وحداته، مستأجريه، عقوده، دفعاته، مصروفاته، طلبات الصيانة، ويستلم إشعارات (متأخرات، عقود قاربت تنتهي، إلخ) — عبر تطبيق Flutter يستهلك API الخاص فينا.

---

## 2. القرارات التقنية المحسومة

| القرار | التفاصيل |
|---|---|
| **Frontend/Backend Framework** | Next.js (App Router) |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (لكل من Master Admin و Owner) |
| **File Storage** | Supabase Storage |
| **اشتراكات/باقات للـ Owners** | لا يوجد — كل Owner نفس الصلاحيات |
| **رؤية Master Admin لبيانات Owner** | إحصائية/عددية فقط، بدون تفاصيل عقود/دفعات |
| **Mobile App (للـ Owner)** | Flutter — مبرمج منفصل، يستهلك الـ API فقط |
| **الإشعارات** | تخزين بجدول `notifications` + Push حقيقي عبر **FCM (Firebase Cloud Messaging)** |
| **تسجيل Owner جديد** | فقط عبر Master Admin (لا يوجد self-signup) |

---

## 3. حالة مشروع Supabase (جاهز وشغال فعلياً)

- **Project name**: `mandera-properties-management`
- **Project ID**: `btjfbaccgueeybkeggzi`
- **Region**: `eu-west-1`
- الـ Database Schema **مطبّق بالكامل فعلياً** على هذا المشروع (10 جداول + كل الـ enums + RLS policies + sequence لرقم العقد).
- **أول حساب Master Admin موجود فعلياً**:
  - الإيميل: `mostafaibrahim20032020@gmail.com`
  - كلمة المرور: `Mostafa123` (يُنصح تغييرها لاحقاً من واجهة النظام)

> **مهم:** لازم تجيب الـ Supabase API keys (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, و `SUPABASE_SERVICE_ROLE_KEY`) من Supabase Dashboard → المشروع `mandera-properties-management` → Settings → API، وتحطهم بملف `.env.local`.

---

## 4. Database Schema (ملخص الجداول)

### `users` (Profile table مرتبط بـ `auth.users`)
عمود `role` بس فيه `master_admin` أو `owner`. جدول واحد للدورين، ما في self-signup للـ owner.

الأعمدة: `id (uuid, FK→auth.users)`, `role`, `full_name`, `phone`, `email`, `avatar_url`, `is_active (bool)`, `created_by`, `created_at`, `updated_at`, `deleted_at`

### `properties` (العقارات)
`id`, `owner_id`, `name`, `type (enum: building/villa/complex/other)`, `city`, `address`, `latitude`, `longitude`, `image_url`, timestamps, `deleted_at`

### `units` (الوحدات)
`id`, `property_id`, `owner_id`, `unit_number`, `floor`, `unit_type (enum)`, `area`, `bedrooms`, `bathrooms`, `rent_amount`, `status (enum: vacant/occupied/maintenance)`, timestamps, `deleted_at`
> Unique constraint: `(property_id, unit_number)`

### `tenants` (المستأجرين)
`id`, `owner_id`, `full_name`, `national_id`, `phone`, `email`, `photo_url`, `id_document_url`, timestamps, `deleted_at`

### `contracts` (العقود)
`id`, `contract_number (int, sequence عام يبدأ من 10001)`, `owner_id`, `unit_id`, `tenant_id`, `start_date`, `end_date`, `rent_amount`, `payment_cycle (enum: monthly/quarterly/yearly)`, `deposit_amount`, `status (enum: active/expiring_soon/expired/terminated/renewed)`, `contract_file_url`, `renewed_from_contract_id (self-FK)`, timestamps, `deleted_at`

### `payments` (الدفعات)
`id`, `owner_id`, `contract_id`, `unit_id`, `tenant_id`, `amount`, `due_date`, `paid_date`, `payment_method (enum: cash/bank_transfer/card)`, `receipt_url`, `status (enum: pending/paid/overdue)`, `notes`, timestamps

### `expenses` (المصروفات)
`id`, `owner_id`, `property_id`, `unit_id (nullable)`, `expense_type (enum: maintenance/water/electricity/other)`, `amount`, `expense_date`, `description`, `receipt_url`, timestamps

### `maintenance_requests` (طلبات الصيانة)
`id`, `owner_id`, `property_id`, `unit_id`, `tenant_id (nullable)`, `issue_type (enum: plumbing/electrical/ac/other)`, `priority (enum: low/medium/high)`, `description`, `images (text[])`, `status (enum: pending/in_progress/closed)`, `technician_name`, `cost`, `closed_at`, timestamps

### `notifications` (الإشعارات)
`id`, `owner_id`, `type (enum: overdue_payment/contract_expiring/payment_recorded/maintenance_update)`, `title`, `body`, `related_entity_type`, `related_entity_id`, `is_read`, `push_sent`, `created_at`

### `device_tokens` (FCM tokens)
`id`, `owner_id`, `fcm_token (unique)`, `device_type (enum: android/ios)`, timestamps

### RLS Policies
كل جدول عائد لـ Owner (properties, units, tenants, contracts, payments, expenses, maintenance_requests, notifications, device_tokens) عليه RLS: `owner_id = auth.uid()`. جدول `users`: كل مستخدم يشوف/يعدل بروفايله بس (`id = auth.uid()`).

> **Master Admin ما بيمر عبر RLS** — عملياته بتصير من الباك إند فقط عبر `service_role key` (سيرفر-سايد، أبداً من الكلاينت مباشرة).

---

## 5. منطق Business Logic المهم (لازم يُنفذ بالكود)

1. **عند إنشاء عقد جديد (`POST /owner/contracts`)**:
   - توليد صفوف `payments` تلقائياً حسب `payment_cycle` (شهري/ربعي/سنوي) بين `start_date` و `end_date`.
   - تحديث `units.status = 'occupied'`.

2. **عند إنهاء عقد (`POST /owner/contracts/:id/terminate`)**:
   - تحديث `contracts.status = 'terminated'`.
   - إلغاء أي `payments` بحالة `pending` وتاريخ استحقاق مستقبلي.
   - تحديث `units.status = 'vacant'`.

3. **تجديد عقد (`POST /owner/contracts/:id/renew`)**: بينشئ **عقد جديد** (مش تعديل على القديم) مرتبط بـ `renewed_from_contract_id`، والقديم تتحول حالته لـ `renewed`.

4. **Cron يومي (Supabase Edge Function مجدولة عبر pg_cron)**:
   - فحص `payments` بحالة `pending` و `due_date < today` → تحويلها `overdue` + توليد إشعار `overdue_payment`.
   - فحص `contracts` النشطة: تنبيه متدرج على **14 يوم / 7 أيام / 3 أيام** قبل `end_date` → توليد إشعار `contract_expiring` (مرة وحدة لكل threshold، تفادي التكرار).
   - فحص العقود اللي `end_date` عدّى ولا تجدّدت ولا انتهت يدوياً → `status='expired'` + تحديث الوحدة لـ `vacant`.
   - إرسال أي إشعار `push_sent=false` فعلياً عبر FCM API.

5. **عند تسجيل دفعة (`POST /owner/payments`)**: توليد إشعار `payment_recorded` فوري.

---

## 6. API Structure (الـ endpoints المطلوبة)

Base path: `/api/v1/...`. Auth عبر `Authorization: Bearer <supabase_jwt>`.

### A) Owner API (`/api/v1/owner/...`) — لتطبيق Flutter

- **Auth**: `POST /auth/login`, `POST /auth/refresh`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `POST /auth/logout`, `GET /auth/me`
- **Profile**: `GET/PATCH /owner/profile`, `PATCH /owner/profile/password`, `PATCH /owner/profile/settings`
- **Properties**: `GET/POST /owner/properties`, `GET/PATCH/DELETE /owner/properties/:id`, `POST /owner/properties/:id/image`
- **Units**: `GET/POST /owner/units`, `GET/PATCH/DELETE /owner/units/:id`, `PATCH /owner/units/:id/status`
- **Tenants**: `GET/POST /owner/tenants`, `GET/PATCH/DELETE /owner/tenants/:id`, `POST /owner/tenants/:id/document`, `POST /owner/tenants/:id/photo`
- **Contracts**: `GET/POST /owner/contracts`, `GET/PATCH /owner/contracts/:id`, `POST /owner/contracts/:id/renew`, `POST /owner/contracts/:id/terminate`, `POST/GET /owner/contracts/:id/file`
- **Payments**: `GET/POST /owner/payments`, `GET/PATCH /owner/payments/:id`, `POST /owner/payments/:id/receipt`, `GET /owner/payments/overdue`
- **Expenses**: `GET/POST /owner/expenses`, `GET/PATCH/DELETE /owner/expenses/:id`, `POST /owner/expenses/:id/receipt`
- **Maintenance**: `GET/POST /owner/maintenance-requests`, `GET/PATCH /owner/maintenance-requests/:id`, `POST /owner/maintenance-requests/:id/close`, `POST /owner/maintenance-requests/:id/images`
- **Notifications**: `GET /owner/notifications`, `PATCH /owner/notifications/:id/read`, `PATCH /owner/notifications/read-all`, `POST /owner/device-tokens`, `DELETE /owner/device-tokens/:token`
- **Dashboard/Reports**: `GET /owner/dashboard`, `GET /owner/reports`, `GET /owner/reports/properties|contracts|payments|maintenance`, `GET /owner/reports/export`

### B) Master Admin API (`/api/v1/admin/...`) — تُستخدم فقط داخل صفحات Next.js نفسها

- **Auth**: `POST /admin/auth/login`, `POST /admin/auth/logout`, `GET /admin/auth/me`
- **Owners management**: `GET/POST /admin/owners`, `GET/PATCH/DELETE /admin/owners/:id`, `PATCH /admin/owners/:id/toggle-active`
- **Dashboard**: `GET /admin/dashboard` (إحصائيات عامة: عدد Owners نشط/معطل، إجمالي عقارات/وحدات بالنظام)

Response format موحّد:
```json
// Success
{ "success": true, "data": { ... } }
// Error
{ "success": false, "error": { "code": "...", "message": "..." } }
```

---

## 7. صفحات Master Admin المطلوبة (Next.js Web UI)

1. **صفحة تسجيل الدخول** (`/login`) — إيميل/باسورد عبر Supabase Auth، بعد الدخول يتحقق إن `role === 'master_admin'` من جدول `users`.
2. **Middleware** لحماية كل مسارات `/admin/*` — يمنع أي حدا مش `master_admin` (يشمل حتى لو كان owner مسجل دخول بطريقة ما).
3. **Dashboard** — إحصائيات عامة عن المنصة (عدد Owners، عدد عقارات/وحدات بالنظام).
4. **صفحة إدارة Owners** — قائمة (بحث/فلترة)، إضافة Owner جديد (ينشئ `auth.users` + سجل `users` بـ role='owner')، تفعيل/تعطيل، حذف (soft delete).
5. **صفحة تفاصيل Owner واحد** — إحصائيات عددية فقط (عدد عقارات، وحدات، عقود فعالة) — **بدون** تفاصيل دقيقة لعقد/دفعة معينة.

---

## 8. الخطوات التالية المطلوبة من Claude Code

1. عمل scaffold لمشروع Next.js (App Router + TypeScript مفضّل).
2. تثبيت وربط `@supabase/supabase-js` و `@supabase/ssr` (للـ server-side auth مع Next.js).
3. إعداد `.env.local` بمتغيرات Supabase (المستخدم رح يجيب القيم من Dashboard).
4. بناء Supabase client helpers (browser client + server client).
5. بناء صفحة `/login` لـ Master Admin.
6. بناء middleware لحماية `/admin/*`.
7. بناء أول صفحة Dashboard بسيطة كنقطة انطلاق.
8. بعدها التوسع تدريجياً بباقي صفحات الـ Admin والـ Owner API endpoints حسب القوائم أعلاه.

---

## ملاحظات إضافية
- المستخدم (صاحب المشروع) يتواصل بالعربي اللهجة الشامية/الفلسطينية، ويفضل الشرح بالعربي.
- لا يوجد حالياً كود مكتوب — هاي أول خطوة فعلية بالتطوير.

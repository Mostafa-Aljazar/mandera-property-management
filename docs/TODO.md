# الناقص بالمشروع — Mandera Properties Management

> آخر تحديث: 2026-08-12. هاد الملف بيغطي بس **الناقص**، مو ملخص كامل للمشروع (هيك موجود بـ `PROJECT_SUMMARY.md`). راجعه بشكل دوري وشطب أي بند خلص.

---

## ✅ خلاصة سريعة: شو تم فعلاً لهلق

- Next.js scaffold + Supabase (client/server/admin/middleware helpers) + shadcn/ui design system.
- تسجيل دخول Master Admin + middleware حماية `/admin/*`.
- Dashboard بإحصائيات عامة.
- إدارة Owners كاملة: قائمة (بحث/فلترة/pagination)، إضافة، تعديل، ملاحظات داخلية، تفعيل/تعطيل، حذف (soft delete)، صورة شخصية، مستند هوية.
- صفحة بروفايل الـ Master Admin (تعديل بيانات + كلمة مرور + صورة).
- Schema الكامل مطبّق على Supabase (10 جداول + أعمدة إضافية على `users`: `national_id`, `valid_until`, `account_status`, `company_name`, `city`, `notes`, `id_document_url`) + RLS.
- Storage buckets: `avatars` و`property-images` (public + RLS بحسب `auth.uid()`).
- **Owner API بلشت فعلياً**: `auth/login`, `auth/me`, `properties` (CRUD + رفع صورة), `units` (CRUD + تحديث الحالة) — كلها مبنية على `requireOwner()` helper موحّد بيتحقق من الـ JWT والدور والحالة، وبترجع نفس الـ response format المتفق عليه. مفحوصة بطلبات HTTP حقيقية (login → CRUD → عزل بين الملاك → soft delete → 404/401/409).

**لسه صفر بالكامل:** كل الـ Business Logic (توليد دفعات، تجديد/إنهاء عقود)، Edge Functions/Cron، FCM، وباقي الـ Owner API (profile, contracts, payments, expenses, maintenance, notifications, reports).

---

## 1. Owner API (`/api/v1/owner/...`) — لتطبيق Flutter

هاد أكبر جزء ناقص وأهمه — تطبيق Flutter ما بيقدر يبلش عليه إطلاقاً قبل ما يصير موجود. بلشنا فيه فعلياً (auth + properties + units جاهزين ومفحوصين بطلبات HTTP حقيقية).

### Auth
- [x] `POST /api/v1/owner/auth/login`
- [ ] `POST /api/v1/owner/auth/refresh`
- [ ] `POST /api/v1/owner/auth/forgot-password`
- [ ] `POST /api/v1/owner/auth/reset-password`
- [ ] `POST /api/v1/owner/auth/logout`
- [x] `GET /api/v1/owner/auth/me`

### Profile
- [ ] `GET/PATCH /api/v1/owner/profile`
- [ ] `PATCH /api/v1/owner/profile/password`
- [ ] `PATCH /api/v1/owner/profile/settings`

### Properties
- [x] `GET/POST /api/v1/owner/properties`
- [x] `GET/PATCH/DELETE /api/v1/owner/properties/:id`
- [x] `POST /api/v1/owner/properties/:id/image`

### Units
- [x] `GET/POST /api/v1/owner/units` (`GET` بيدعم فلترة `?property_id=`)
- [x] `GET/PATCH/DELETE /api/v1/owner/units/:id`
- [x] `PATCH /api/v1/owner/units/:id/status`

### Tenants
- [x] `GET/POST /api/v1/owner/tenants`
- [x] `GET/PATCH/DELETE /api/v1/owner/tenants/:id`
- [x] `POST /api/v1/owner/tenants/:id/document`
- [x] `POST /api/v1/owner/tenants/:id/photo`

### Contracts
- [ ] `GET/POST /api/v1/owner/contracts`
- [ ] `GET/PATCH /api/v1/owner/contracts/:id`
- [ ] `POST /api/v1/owner/contracts/:id/renew`
- [ ] `POST /api/v1/owner/contracts/:id/terminate`
- [ ] `POST/GET /api/v1/owner/contracts/:id/file`

### Payments
- [ ] `GET/POST /api/v1/owner/payments`
- [ ] `GET/PATCH /api/v1/owner/payments/:id`
- [ ] `POST /api/v1/owner/payments/:id/receipt`
- [ ] `GET /api/v1/owner/payments/overdue`

### Expenses
- [ ] `GET/POST /api/v1/owner/expenses`
- [ ] `GET/PATCH/DELETE /api/v1/owner/expenses/:id`
- [ ] `POST /api/v1/owner/expenses/:id/receipt`

### Maintenance
- [ ] `GET/POST /api/v1/owner/maintenance-requests`
- [ ] `GET/PATCH /api/v1/owner/maintenance-requests/:id`
- [ ] `POST /api/v1/owner/maintenance-requests/:id/close`
- [ ] `POST /api/v1/owner/maintenance-requests/:id/images`

### Notifications
- [ ] `GET /api/v1/owner/notifications`
- [ ] `PATCH /api/v1/owner/notifications/:id/read`
- [ ] `PATCH /api/v1/owner/notifications/read-all`
- [ ] `POST /api/v1/owner/device-tokens`
- [ ] `DELETE /api/v1/owner/device-tokens/:token`

### Dashboard / Reports
- [ ] `GET /api/v1/owner/dashboard`
- [ ] `GET /api/v1/owner/reports`
- [ ] `GET /api/v1/owner/reports/properties|contracts|payments|maintenance`
- [ ] `GET /api/v1/owner/reports/export` (PDF/Excel)

> **ملاحظة تصميم**: كل هاي الـ endpoints لازم تتحقق من `Authorization: Bearer <supabase_jwt>` وتعتمد على RLS (`owner_id = auth.uid()`) — نفس الـ response format الموحّد المذكور بالـ brief (`{success, data}` / `{success:false, error}`).

---

## 2. Business Logic (مرتبطة بالـ Owner API فوق)

- [ ] عند إنشاء عقد (`POST /owner/contracts`): توليد صفوف `payments` تلقائياً حسب `payment_cycle` بين `start_date` و`end_date` + تحديث `units.status = 'occupied'`.
- [ ] عند إنهاء عقد (`POST /owner/contracts/:id/terminate`): `status='terminated'` + إلغاء `payments` المعلّقة المستقبلية + `units.status='vacant'`.
- [ ] تجديد عقد (`POST /owner/contracts/:id/renew`): إنشاء عقد جديد مرتبط بـ `renewed_from_contract_id`، والقديم `status='renewed'`.
- [ ] عند تسجيل دفعة (`POST /owner/payments`): توليد إشعار `payment_recorded` فوري.

---

## 3. Cron / Edge Function يومية (pg_cron + Supabase Edge Function)

- [ ] Edge Function جديدة (لسه صفر — `list_edge_functions` رجّعت فاضية).
- [ ] فحص `payments` بحالة `pending` و`due_date < today` → `overdue` + إشعار `overdue_payment`.
- [ ] تنبيه متدرج لعقود قاربت تنتهي (14 / 7 / 3 أيام) → إشعار `contract_expiring` (مرة وحدة لكل threshold).
- [ ] عقود عدّى تاريخ انتهائها بدون تجديد/إنهاء يدوي → `status='expired'` + `units.status='vacant'`.
- [ ] جدولة الـ Function عبر `pg_cron` (تشغيل يومي).
- [ ] إرسال أي إشعار `push_sent=false` فعلياً (مرتبط بند FCM تحت).

---

## 4. FCM (Firebase Cloud Messaging)

- [ ] إنشاء مشروع Firebase + جلب الـ credentials.
- [ ] منطق إرسال Push فعلي من الـ Edge Function (باستخدام `device_tokens`).
- [ ] endpoints تسجيل/حذف `device_tokens` (موجودة بالقائمة فوق، لسه مو مبنية).

---

## 5. Supabase Storage — Buckets ناقصة

`avatars` و`property-images` موجودين. الأعمدة الباقية يلي بتحتاج ملفات وما إلها bucket بعد:

- [ ] `id_document_url` (owners) — يوجد العمود بالجدول، بس مافي bucket لرفعه من واجهة الـ Admin أو الـ Owner API.
- [x] ~~صور العقارات (`properties.image_url`)~~ — `property-images` bucket + `POST /owner/properties/:id/image` جاهزين.
- [x] صور/مستندات المستأجرين (`tenants.photo_url`, `tenants.id_document_url`) — buckets معمولة + endpoints جاهزة، بس الـ RLS policies لسه محتاجة تشغيل `docs/009_tenant_storage_buckets.sql` يدوياً (شوف الملاحظة فوق).
- [ ] ملفات العقود (`contracts.contract_file_url`).
- [ ] إيصالات الدفعات والمصروفات (`payments.receipt_url`, `expenses.receipt_url`).
- [ ] صور طلبات الصيانة (`maintenance_requests.images`).

كل وحدة محتاجة bucket + RLS policies بنفس نمط `avatars` (owner يشوف/يرفع بس ملفاته، عبر مسار `{owner_id}/...`).

---

## 6. Master Admin API (`/api/v1/admin/...`)

مذكورة بالـ brief كـ API layer، بس حالياً متطبّقة عملياً عبر **Server Actions** (`src/actions/admin/...`) بدل REST routes — وهاد مقبول تماماً لأنها "تُستخدم فقط داخل صفحات Next.js نفسها" حسب الـ brief. **مش ناقص فعلياً**، بس لو حبيت لاحقاً تحويلها لـ routes حقيقية (مثلاً لو بدك تستهلكها من مكان تاني)، هاد قرار مفتوح.

---

## 7. تحسينات بسيطة على واجهة الـ Admin

- [x] "نسيت كلمة المرور" بصفحة `/login` (حالياً بس تسجيل دخول مباشر، ولا يوجد استرجاع لو نسي الـ Master Admin كلمة سره).
- [ ] معالجة حالة `account_status = 'pending'` تلقائياً (لما `valid_until` ينتهي) — لازم نتأكد فيه إذا في trigger/cron بيحدثها تلقائياً أو لسه يدوي بس.

---

## 8. جودة و Deployment

- [ ] Automated tests (unit/integration) — لهلق كل الفحص كان يدوي/Playwright مؤقت أثناء التطوير، ولا يوجد test suite دائم بالمشروع.
- [ ] نشر المشروع (Vercel أو غيره) + متغيرات بيئة production.
- [ ] CI/CD (لينت + type-check + build قبل أي دمج).
- [ ] توثيق الـ API (OpenAPI/Swagger أو ملف Markdown) لتسليمه لمبرمج تطبيق Flutter — ما فيه شي يتوثق قبل ما الـ endpoints تتبنى.

---

## الأولوية المقترحة (بترتيب منطقي)

1. **Owner API الأساسي**: auth + profile + properties + units (أساس أي شي تاني).
2. **Business logic لإنشاء/إنهاء/تجديد العقود** (مرتبطة مباشرة بالـ contracts/payments endpoints).
3. **باقي الـ Owner API**: tenants, payments, expenses, maintenance, notifications, dashboard/reports.
4. **Storage buckets الباقية** (كل واحد وقت ما يلزمه endpoint معين).
5. **Cron/Edge Function + FCM** (بعد ما تصير الـ endpoints والبيانات جاهزة لتختبر عليها).
6. **نسيت كلمة المرور + تحسينات الـ Admin الصغيرة** (مش مستعجلة).
7. **Tests + Deployment + توثيق API** (قبل التسليم لمبرمج الـ Flutter).

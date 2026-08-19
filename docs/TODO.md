# الناقص بالمشروع — Mandera Properties Management

> آخر تحديث: 2026-08-18. هاد الملف بيغطي بس **الناقص**، مو ملخص كامل للمشروع (هيك موجود بـ `PROJECT_SUMMARY.md`). راجعه بشكل دوري وشطب أي بند خلص.

---

## ✅ خلاصة سريعة: شو تم فعلاً لهلق

- Next.js scaffold + Supabase (client/server/admin/middleware helpers) + shadcn/ui design system.
- تسجيل دخول Master Admin + middleware حماية `/admin/*`.
- Dashboard بإحصائيات عامة.
- إدارة Owners كاملة: قائمة (بحث/فلترة/pagination)، إضافة، تعديل، ملاحظات داخلية، تفعيل/تعطيل، حذف (soft delete)، صورة شخصية، مستند هوية.
- صفحة بروفايل الـ Master Admin (تعديل بيانات + كلمة مرور + صورة).
- **Owner API أُعيد بناؤه بالكامل ليطابق `docs/openapi.yaml`** (العقد المرسل من فريق الموبايل) — راجع القسم 1 تحت للتفاصيل. الـ REST-ful CRUD القديم تحت `/api/v1/owner/**` تم حذف الجزء المستبدَل منه، وبقي بس الجزء المؤجَّل (موثّق بـ `docs/اضافات-مستقبلية/`).
- Storage buckets: `avatars`, `property-images`, `unit-images` (+ RLS بحسب `auth.uid()`), إضافة لباقي الـ buckets المذكورة بالقسم 5.
- **صفحة توثيق API حية**: `/api-docs` (Swagger UI، بدون أي CDN — `swagger-ui-dist` مثبّتة كـ dependency و`postinstall` بينسخ ملفاتها لـ `public/swagger-ui/`) بتعرض `public/openapi.yaml` (نسخة عن `docs/openapi.yaml` الأصلي + إضافة `/uploads/sign`).

**لسه صفر بالكامل:** Edge Functions/Cron، FCM (إرسال Push فعلي)، اختبار الـ endpoints الجديدة بطلبات HTTP حقيقية (راجع القسم 1.3).

---

## 1. Owner API — أُعيد بناؤه ليطابق `docs/openapi.yaml`

الأساس المنطقي الكامل موثّق بخطة `docs-openapi-yaml-cozy-wreath` (كانت مبنية بجلسة سابقة). الملخص: العقد المرسل من فريق الموبايل (`docs/openapi.yaml`) شكله مختلف جذرياً عن الـ Owner API القديم (مسارات مسطّحة بدون `/owner`، بدون CRUD تفصيلي بـ `{id}`، response بصيغة JSON خام بدل `{success, data}`).

### 1.1 المسارات الجديدة — مبنية ومُجمَّعة (`npm run build` ناجح)

كلها تحت `/api/v1/...` (بدون `/owner`)، باستخدام `requireOwnerOpenApi()` للمصادقة (وليس `requireOwner()` — راجع 1.3) و`openApiSuccess`/`openApiError` (`src/lib/api/openapi-response.ts`) للـ response:

- [x] `POST /auth/login`, `POST /auth/register`, `POST /auth/forgot-password`
- [x] `GET /user/profile`
- [x] `GET/POST /properties`
- [x] `GET/POST /units`
- [x] `GET/POST /tenants`
- [x] `GET/POST /contracts`
- [x] `GET/POST /payments`, `GET /payments/overdue`
- [x] `GET/POST /expenses`
- [x] `GET/POST /maintenance-requests`
- [x] `GET /dashboard/summary`
- [x] `POST /uploads/sign` — **إضافة مش موجودة بـ `openapi.yaml`**، راجع 1.5.

### 1.2 قاعدة البيانات — Migrations مُطبَّقة فعلياً عبر Supabase MCP

- [x] `015_property_type_enum_rebuild` — `property_type` صار `residential|commercial|mixed_use`.
- [x] `016_unit_and_payment_enums` — `unit_status` (`available|rented|maintenance`), `payment_status` (`due|paid|overdue`), `maintenance_status` (`new_request|in_progress|completed`) + قيم إضافية على `payment_method`/`expense_type`/`maintenance_issue_type`/`unit_type` + enum جديد `rent_period`.
- [x] `017_new_columns_and_bucket` — أعمدة جديدة (`district`, `annual_rent`, `rent_period`, `amenities`, `images`, `rooms` بدل `bedrooms`, `nationality`, `nationality_code`, `is_verified`, `job_title`، إلخ) + bucket `unit-images`.
- [x] `018_unit_images_bucket_rls` — RLS policies لـ `unit-images` (طُبّقت عبر `execute_sql` مباشرة لأن `apply_migration` ما بيقدر يعدّل `storage.objects` بسبب ownership).
- [x] `database.types.ts` أُعيد توليده بالكامل عبر `generate_typescript_types` ويعكس كل التغييرات فوق.

> **ملاحظة مهمة اتعلّمناها هالجلسة**: لو صار error `28P01: password authentication failed` من Supabase MCP، أول خطوة هي التأكد من حالة المشروع فعلياً بالـ dashboard (مش الاعتماد على `ACTIVE_HEALTHY` اللي ممكن يكون قديم/cached) — غالباً يكون سببه Project hibernation (Free tier) مش مشكلة credentials فعلية.

### 1.3 خطوات التحقق (Verification)

- [x] **مقارنة شكل الاستجابة مع `docs/openapi.yaml` حرفياً (أسماء الحقول، required، قيم الـ enums) — تمت لكل الموارد (2026-08-18)**، مو بس الأعلى خطورة. اكتُشف إن 6 من 8 موارد كانت فيها اختلافات جوهرية بأسماء الحقول (`type` بدل `unit_type`, `method` بدل `payment_method`, `category` بدل `expense_type`...) وقيم enums (dashboard alerts كانت مفرد بدل جمع) وتنسيق تواريخ (spec بده حقول `*_label` عربية منسّقة مسبقاً — `1 يناير 2024` — مو ISO خام، ما عدا `Payment.date_label` اللي شكله `2024/05/02`). أُضيف helper مشترك `src/lib/api/date-labels.ts` (تنسيق تواريخ عربي) و`src/lib/api/labels.ts` (تسميات عربية لـ unit_type/expense category/maintenance issue type) واستُخدما لإعادة كتابة كل الـ endpoints والـ validation schemas المرتبطة (`units`, `tenants`, `contracts`, `payments`+`overdue`, `expenses`, `maintenance-requests`, `dashboard/summary`) لتطابق الـ spec حرفياً. `properties` و`user/profile` كانوا مطابقين أصلاً من الجلسة الأولى.
- [x] منطق `installments[]` بـ `GET/POST /contracts` صُحّح: `paid`→`paid`, `overdue`→`pending`, `due` مستقبلي→`upcoming`, `due` فات موعده→`pending`.
- [x] `bucket` صور طلبات الصيانة تحوّل لـ `maintenance-images` (بدل `unit-images` placeholder).
- [x] `bucket` صور/مستندات المستأجرين تحوّل لـ `tenant-photos`/`tenant-documents` الحقيقيين (بدل `unit-images` placeholder) — كانوا موجودين أصلاً بـ RLS من `migrations/009_tenant_storage_buckets.sql` ومهملين بالغلط.
- [x] إيصال الدفعة (`POST /payments` — حقل `receipt`) صار يستخدم `uploadOwnerDocument` (يقبل PDF لحد 10 ميجا، مطابق لمواصفات bucket `payment-receipts`) بدل `uploadOwnerImage` (صور فقط 5 ميجا) اللي كان مستخدم غلط.
- [x] تحسين حساب `revenue_points` بـ `GET /dashboard/summary` — صار استعلام واحد لكل الدفعات/المصروفات وحساب الأشهر الستة بالذاكرة، بدل 6 استعلامات متتالية.
- [x] **باگ حقيقي بمصادقة كل الـ endpoints الجديدة (2026-08-19)**: `requireOwner()` كان يرجّع أخطاء 401/403 بصيغة `{success:false, error:{code,message}}` (envelope القديم)، مش `{message}` اللي الـ spec والـ Flutter client (`Failure.from()`) بيتوقعوه. يعني أي token منتهي/غلط كان بيرجع رسالة خطأ **مش مفهومة للعميل** (بيفشل يقرأ `message` فيرجع generic fallback). الحل: helper جديد `requireOwnerOpenApi()` بـ `src/lib/api/auth.ts` (بيرجع `openApiError` الصحيح) — استُخدم بكل الـ 11 route الجديدة (بما فيها `/uploads/sign`)، والمسارات القديمة تحت `/owner/**` ضلّت على `requireOwner()` الأصلي بدون أي تغيير.
- [x] باگ حقيقي بـ `POST /contracts`: كان يتحقق من الوحدة بـ `unit_id` بس بدون التأكد إنها تابعة فعلاً لـ `property_id` المُرسل بنفس الـ request — صار يتحقق من الاثنين معاً.
- [x] نفس الباگ بـ `POST /payments`: كان يلاقي أي عقد نشط للمستأجر بغض النظر عن العقار، فلو كان عندو عقدين بعقارين مختلفين ممكن يربط الدفعة بعقار غلط — صار يفلتر على `property_id` كمان.
- [ ] فحص كل endpoint جديد بطلبات HTTP حقيقية: register → login → إنشاء property/unit/tenant/contract/payment/expense/maintenance-request → قوائم → dashboard/summary → overdue. **لسه ما تم — أهم خطوة متبقية.**
- [ ] تشغيل `mcp__claude_ai_Supabase__get_advisors` (security + performance) بعد الـ migrations للتأكد ما في مشاكل RLS/أداء نتجت عن الأعمدة/الـ bucket الجديدة.
- [ ] التأكد إن صفحة تعديل الـ owner بالـ Admin (`src/actions/admin/owners/updateOwner.action.ts` وschema المرتبط فيها) بتتحمّل `valid_until = null` بدون كراش — لأن `POST /auth/register` الجديد بيسجّل owner بـ `valid_until=NULL` (تسجيل ذاتي بدون ما الـ Admin يحدد تاريخ صلاحية مسبقاً).
- [ ] `growth_percent` بـ `GET /payments/overdue` حالياً ثابت `0` (مافي بيانات تاريخية مخزّنة نقارن فيها) — قرار مفتوح إذا احتجنا نخزّن snapshots دورية لحسابه فعلياً.
- [ ] بعض حقول الـ request مقبولة بس مش مخزّنة بعمود مخصص لأن ما في عمود بالجدول أصلاً: `CreateTenantRequest.mobile` (بيتخزّن كـ `phone`)، `CreateContractRequest.notes`، `CreateExpenseRequest.vendor_name` (بينضاف كنص داخل `description`)، `CreatePaymentRequest.reference_number` (بينضاف كنص داخل `notes`). مقبول للـ response matching بس لو احتجنا نرجعهم لاحقاً بحقل مستقل، لازم migration أعمدة جديدة.
- [ ] كل الملاحظات والتناقضات المكتشفة بالـ spec نفسه (مش بالتطبيق) موثّقة بملف منفصل لمبرمج الموبايل: [`docs/openapi-issues.md`](openapi-issues.md) — يحتاج مراجعته وحسم الأسئلة المفتوحة فيه معه.

### 1.5 رفع الملفات مباشرة لـ Supabase (تجاوز حد Vercel 4.5MB) — 2026-08-19

Vercel بيحدد حجم الـ request body الكلي لأي Serverless Function بـ ~4.5 ميجا — وهاد حد على مستوى المنصة نفسها، ما في طريقة نتجاوزه من كود الـ backend لأن الطلب بينرفض قبل ما كودنا يشتغل أصلاً. صور الموبايل الحديثة ممكن تتعدى هاد الحد بسهولة (خصوصاً بمواقف زي رفع أكتر من صورة وحدة بطلب واحد، أو صورة شخصية + هوية مع بعض).

- [x] endpoint جديد `POST /uploads/sign` (**مش موجود بـ `openapi.yaml`** — إضافة من طرفنا، موثّقة بـ [`docs/openapi-issues.md`](openapi-issues.md#8-رفع-الملفات-multipartform-data-بحقول-binary-بيتعارض-مع-حد-vercel-45mb-على-الـ-request-body)) بيرجع Supabase signed upload URL — الموبايل يرفع الملف مباشرة لـ Supabase Storage، وبعدين يبعت الـ `public_url` الراجعة كنص عادي بدل الملف الخام بنفس حقل الـ multipart.
- [x] `src/lib/api/upload.ts`: `createSignedUpload()` (تجهيز الرابط) و`resolveUploadedField()` (helper موحّد بيقبل إما `File` خام — المسار القديم، بيعدّي عبر Vercel — أو `string` (path/public URL) من رفع مباشر سابق؛ بيتحقق إن الـ string فعلاً ضمن مجلد الـ owner بنفس الـ bucket قبل ما يوثق فيه).
- [x] كل الـ create endpoints يلي فيها ملفات (`properties`, `units`, `tenants`, `maintenance-requests`, `payments`) صارت تستخدم `resolveUploadedField()` — تقبل الشكلين (ملف خام أو نص URL) بنفس الحقل، فما في كسر توافق فوري مع أي عميل موجود حالياً.
- [ ] **لازم تنسيق مع فريق الموبايل**: هاي الخطوة الإضافية (`POST /uploads/sign` → رفع مباشر → إرسال الـ URL) مش موجودة بالـ Dart code الحالي المرسل — لازم يتبنوها بالتطبيق قبل ما تصير فعلياً حل لمشكلة الـ 4.5 ميجا (لحد هلق، أي رفع من التطبيق الحالي لسه بيمر عبر Vercel وبيضل عرضة لنفس الحد).

### 1.4 القديم تحت `/api/v1/owner/**` — الحالة بعد الحذف (2026-08-18)

تم حذف الجزء المستبدَل بالكامل بالمسارات الجديدة فوق (properties, units, tenants, payments, contracts list/create, expenses, maintenance-requests list/create, dashboard, profile, auth/login, auth/me). التفاصيل الكاملة لكل مسار انحذف (وأيّها قابل للاسترجاع من git وأيّها لأ) موثّقة بـ [`docs/اضافات-مستقبلية/crud-كامل.md`](اضافات-مستقبلية/crud-كامل.md).

**بقي شغّال بدون تغيير وظيفي** (بس تحديث قيم الـ enums للتوافق مع migrations 015-016)، لأنه مؤجَّل مش جزء من عقد الموبايل حالياً:
- `contracts/[id]/renew`, `contracts/[id]/terminate`, `contracts/[id]/file` — [`عقود-تجديد-وإنهاء.md`](اضافات-مستقبلية/عقود-تجديد-وإنهاء.md)
- `notifications/**`, `device-tokens/**` — [`اشعارات-و-fcm.md`](اضافات-مستقبلية/اشعارات-و-fcm.md)
- `reports/**` — [`تقارير-و-تصدير.md`](اضافات-مستقبلية/تقارير-و-تصدير.md)

`send-otp`/`verify-otp` بالـ spec لم تُبنَ إطلاقاً (موسومة "unverified" بالـ spec نفسه) — [`otp-endpoints.md`](اضافات-مستقبلية/otp-endpoints.md).

---

## 2. Business Logic (من النظام القديم — ينطبق على الجزء المؤجَّل فقط)

هاي كانت موثّقة أصلاً للنظام القديم؛ الجزء المرتبط بمسارات محذوفة (إنشاء/دفعات) أُعيد بناؤه ضمن الـ endpoints الجديدة بالقسم 1 (يحتاج تأكيد سلوكه المطابق ضمن 1.3). الجزء المرتبط بالمسارات المؤجَّلة (renew/terminate) لسه ساري كما هو:

- [x] تجديد عقد (`POST /owner/contracts/:id/renew`): إنشاء عقد جديد بجدول دفعات كامل خاص فيه، مرتبط بـ `renewed_from_contract_id`، والقديم `status='renewed'`.
- [x] إنهاء عقد (`POST /owner/contracts/:id/terminate`): `status='terminated'` + حذف `payments` بحالة `due` اللي تاريخ استحقاقها لسه ما إجا + `units.status='available'`.
- [ ] تأكيد أن منطق توليد `payments` تلقائياً عند إنشاء عقد (`POST /contracts` الجديد) ما زال يعمل كما كان — الـ endpoint الجديد يستقبل جدول الدفعات مباشرة من العميل (`payments` كـ JSON string) بدل التوليد التلقائي حسب `payment_cycle`، فهاي نقطة تغيير سلوك متعمَّدة حسب الخطة، مو bug.

---

## 3. Cron / Edge Function يومية (pg_cron + Supabase Edge Function)

- [ ] Edge Function جديدة (لسه صفر — `list_edge_functions` رجّعت فاضية).
- [ ] فحص `payments` بحالة `due` و`due_date < today` → `overdue` + إشعار `overdue_payment`.
- [ ] تنبيه متدرج لعقود قاربت تنتهي (14 / 7 / 3 أيام) → إشعار `contract_expiring` (مرة وحدة لكل threshold).
- [ ] عقود عدّى تاريخ انتهائها بدون تجديد/إنهاء يدوي → `status='expired'` + `units.status='available'`.
- [ ] جدولة الـ Function عبر `pg_cron` (تشغيل يومي).
- [ ] إرسال أي إشعار `push_sent=false` فعلياً (مرتبط بند FCM تحت).

---

## 4. FCM (Firebase Cloud Messaging)

- [ ] إنشاء مشروع Firebase + جلب الـ credentials.
- [ ] منطق إرسال Push فعلي من الـ Edge Function (باستخدام `device_tokens`).
- [x] endpoints تسجيل/حذف `device_tokens` جاهزة (مؤجَّلة تحت `/owner/device-tokens/**`) — بس لسه ما في إرسال Push حقيقي يستخدمها.

---

## 5. Supabase Storage — Buckets

- [x] `avatars`, `property-images`, `unit-images` — موجودين + RLS.
- [x] صور/مستندات المستأجرين (`tenants.photo_url`, `tenants.id_document_url`) — bucket قديم `tenant-*` موجود من النظام القديم، بس الـ endpoint الجديد (`POST /tenants`) حالياً بيرفع لـ `unit-images` كـ placeholder (راجع 1.3).
- [x] ملفات العقود (`contracts.contract_file_url`) — `contract-files` bucket (مؤجَّل، يُستخدم فقط من `owner/contracts/:id/file`).
- [x] إيصالات الدفعات (`payments.receipt_url`) — `payment-receipts` bucket (بدون endpoint حالياً بعد حذف `owner/payments/:id/receipt` — راجع `crud-كامل.md`).
- [x] إيصالات المصروفات (`expenses.receipt_url`) — `expense-receipts` bucket (نفس الوضع).
- [x] صور طلبات الصيانة (`maintenance_requests.images`) — `maintenance-images` bucket موجود، بس الـ endpoint الجديد (`POST /maintenance-requests`) حالياً بيرفع لـ `unit-images` (راجع 1.3 — bug محتمل).
- [ ] `id_document_url` (owners) — يوجد العمود بالجدول، بس مافي bucket لرفعه من واجهة الـ Admin أو الـ Owner API.

---

## 6. Master Admin API (`/api/v1/admin/...`)

مذكورة بالـ brief كـ API layer، بس حالياً متطبّقة عملياً عبر **Server Actions** (`src/actions/admin/...`) بدل REST routes — وهاد مقبول تماماً. **مش ناقص فعلياً**.

---

## 7. تحسينات بسيطة على واجهة الـ Admin

- [x] "نسيت كلمة المرور" بصفحة `/login`.
- [ ] معالجة حالة `account_status = 'pending'` تلقائياً (لما `valid_until` ينتهي).
- [ ] تأكيد تحمّل شاشة تعديل الـ owner لـ `valid_until = null` (راجع 1.3 — أصبحت ذات أولوية أعلى بعد تفعيل `POST /auth/register` الذاتي).

---

## 8. جودة و Deployment

- [ ] Automated tests (unit/integration).
- [ ] نشر المشروع (Vercel أو غيره) + متغيرات بيئة production.
- [ ] CI/CD (لينت + type-check + build قبل أي دمج).
- [x] توثيق الـ API — `docs/openapi.yaml` هو المرجع الرسمي المرسل من فريق الموبايل، والـ endpoints الجديدة مبنية لتطابقه حرفياً.

---

## الأولوية المقترحة (بترتيب منطقي)

1. ~~**Owner API rebuild ليطابق `docs/openapi.yaml`**: migrations + types + كل الـ endpoints الجديدة~~ ✅ (البناء ناجح، الحذف تم، التوثيق تم — 2026-08-18).
2. **فحص الـ endpoints الجديدة بطلبات HTTP حقيقية + مقارنتها بالـ spec حرفياً** (القسم 1.3) — الخطوة الحرجة الجاية قبل تسليم أي شي لفريق الموبايل.
3. حسم قرارات الـ buckets المعلّقة (tenants, maintenance-requests) والمنطق (`installments[]` mapping).
4. **Cron/Edge Function + FCM**.
5. **تحسينات الـ Admin الصغيرة المتبقية**.
6. **Tests + Deployment**.

# مرجع الـ API — الوضع الحالي

> هذا الملف يوثّق فقط ما هو مطبّق وموجود بالكود الآن. لتفاصيل كل schema/field ارجع لـ `public/openapi.yaml` (المصدر الرسمي) أو اقرأ الكود مباشرة تحت `src/app/api/v1/`.

## بنية المسارات

كل شيء تحت `/api/v1/`، مسطّح (بدون `/owner` prefix)، Auth عبر `Authorization: Bearer <supabase_jwt>`.

| المجموعة | المسارات |
|---|---|
| Auth | `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh`, `POST /auth/forgot-password`, `POST /auth/send-otp`*, `POST /auth/verify-otp`* |
| Profile | `GET /user/profile` |
| Team | `GET/POST /team-members` |
| Properties | `GET/POST /properties` |
| Units | `GET/POST /units`, `POST /units/vacant-report/send` |
| Tenants | `GET/POST /tenants` |
| Contracts | `GET/POST /contracts` |
| Payments | `GET/POST /payments`, `GET /payments/overdue` |
| Expenses | `GET/POST /expenses` |
| Maintenance | `GET/POST /maintenance-requests` |
| Brokers | `GET/POST /brokers` |
| Dashboard | `GET /dashboard/summary` |
| Uploads | `POST /uploads/sign` (رفع مباشر لتجاوز حد Vercel 4.5MB) |

\* `send-otp`/`verify-otp` معرّفة بالـ schema لكن غير مستخدَمة فعلياً (لا يوجد نظام OTP على تسجيل الدخول).

بالإضافة لمسارات قديمة لا تزال تعمل تحت `/api/v1/owner/**` (renew/terminate/file عقود، notifications، device-tokens، reports) — غير موثّقة بـ `openapi.yaml` لأنها ليست جزء من العقد المتفق عليه مع تطبيق الموبايل الحالي، لكنها فعّالة وتُستخدم من واجهة الويب.

## المصادقة والصلاحيات (`src/lib/api/auth.ts`)

- كل الطلبات تتطلب `Authorization: Bearer <token>`.
- `role` يجب أن يكون `owner` (يشمل manager/administrator/assistant). `master_admin` غير مسموح له بالدخول عبر هذا الـ API.
- الحساب يجب أن يكون `is_active = true` و`deleted_at is null`.
- `ownerId` (المستخدم لـ RLS والـ scoping) = `organization_id` إن وُجد، وإلا `id` المستخدم نفسه.
- `userId` = هوية المستخدم الفعلي الذي سجّل الدخول (مختلف عن `ownerId` لأعضاء الفريق غير manager).

## نموذج الفريق (Team / Rank)

- الشركة تُنشأ من الـ dashboard بواسطة master_admin.
- أول حساب owner للشركة يصبح تلقائيًا `rank = manager`, `organization_id = id` (نفسه) — عبر trigger `trg_users_organization_context`.
- فقط `rank = manager` يقدر يستخدم `POST /team-members` لإضافة عضو جديد (أي rank، بلا حد أقصى).
- `organization_id` للعضو الجديد يُشتق دائمًا من `ownerId` الخاص بالمدير المصادق عليه — لا يُقرأ من body الطلب أبدًا.
- `GET /team-members` يرجّع أعضاء نفس `organization_id` فقط، ويستثني المدير الحالي من القائمة.

## RLS / DB scoping

- `public.current_owner_id()` (SQL function, `security definer`) تحل هوية أي عضو مصادق عليه (owner فعّال) إلى `organization_id` أو `id`.
- كل الجداول التشغيلية (properties, units, tenants, contracts, payments, expenses, maintenance_requests, brokers) عليها RLS تستخدم `owner_id = current_owner_id()`.
- Storage buckets المرتبطة بنفس الموارد لها policies مماثلة تستخدم أول مجلد بالمسار = `current_owner_id()::text`.
- جدول `users` نفسه: كل مستخدم يشوف/يعدّل بروفايله فقط (`id = auth.uid()`).

## قاعدة البيانات

مشروع Supabase: `mandera-properties-management` (`btjfbaccgueeybkeggzi`, `eu-west-1`). الجداول الحالية (`src/lib/supabase/database.types.ts` هو المصدر الدقيق لأي عمود/enum):

`users`, `properties`, `units`, `tenants`, `contracts`, `payments`, `expenses`, `maintenance_requests`, `notifications`, `device_tokens`, `brokers`, `vacant_unit_reports`, `subscription_payments`.

كل الـ migrations الفعلية مرتّبة زمنيًا تحت `docs/migrations/` وهي السجل التاريخي الدقيق للتغييرات على الـ schema — لا حاجة لتكرار تفاصيلها هون.

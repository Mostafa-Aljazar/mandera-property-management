# Mandera Properties Management — نظرة عامة

نظام إدارة عقارات مؤجرة، بيتكون من:
- **Next.js app واحد** بيخدم **واجهة الويب لـ Master Admin** (صفحات + Server Actions).
- **REST API مسطّح** تحت `/api/v1/*` يستهلكه تطبيق **Flutter** منفصل (شركات إدارة العقارات).

## الأدوار

النظام فيه دورين على مستوى عمود `role` بجدول `users`:

1. **`master_admin`** — يدير حسابات الشركات (owners) من واجهة الويب: إضافة، تفعيل/تعطيل، حذف (soft delete)، اشتراكات/مدفوعات. رؤية إحصائية فقط على بيانات كل شركة، بدون دخول على تفاصيل عقود/دفعات.
2. **`owner`** — كل مستخدمي شركة عقارية. يُفرَّق بينهم بعمود `rank`:
   - **`manager`** — مدير الشركة. يسجّل دخول من تطبيق الموبايل، يقدر يضيف أعضاء فريق جدد (بأي rank، بما فيه manager آخر — لا يوجد حد أقصى).
   - **`administrator`**
   - **`assistant`**

   كل أعضاء الشركة (بغض النظر عن الـ rank) يعملون بنفس الـ company scope عبر `organization_id` (يشير لحساب الـ manager الأصلي). كل الموارد (properties, units, tenants, contracts, payments, expenses, maintenance_requests, brokers) محمية بـ RLS تستخدم `current_owner_id()` لحل `organization_id` تلقائياً.

**Tenant** (المستأجر) ما إله أي وصول للنظام — مجرد سجل بيانات يديره الـ owner.

## القرارات التقنية

| القرار | التفاصيل |
|---|---|
| Framework | Next.js (App Router) |
| Database | Supabase (PostgreSQL) — مشروع `mandera-properties-management` (`btjfbaccgueeybkeggzi`, `eu-west-1`) |
| Auth | Supabase Auth، لكل من master_admin وowner/team members |
| File Storage | Supabase Storage |
| Mobile App | Flutter — مبرمج منفصل، يستهلك `/api/v1/*` فقط |
| تسجيل owner جديد | حصراً عبر Master Admin من الـ dashboard؛ الموبايل لا يرسل `organization_id` أبداً — يُشتق من الـ bearer token |
| Response envelope (`/api/v1/*`) | JSON خام عند النجاح، `{ "message": "..." }` عند الفشل (`openApiSuccess`/`openApiError`) |

## المرجع الرسمي للـ API

`public/openapi.yaml` هو الـ contract النهائي المطابق فعلياً لكل route تحت `src/app/api/v1/`. أي مقارنة أو تكامل مع الموبايل يجب أن يعتمد عليه.

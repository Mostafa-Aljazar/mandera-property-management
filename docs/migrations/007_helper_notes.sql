-- ============================================================
-- Migration 007: ملاحظات ومنطق مساعد (ليست إلزامية التنفيذ الفوري،
-- لكن موصى فيها لضمان اتساق البيانات)
-- ============================================================

-- ملاحظة 1:
-- إنشاء حساب Owner جديد لا يتم عبر SQL مباشرة، بل عبر:
--   supabase.auth.admin.createUser({ email, password })  -- من الباك إند (service_role)
-- ثم إدخال سجل في public.users بنفس الـ id الراجع، بـ role='owner'.
-- هاي الخطوة هتُنفذ من كود الـ API (route: POST /admin/owners)، مش من الـ SQL migration.

-- ملاحظة 2:
-- عمود unit_number فريد ضمن نفس property_id فقط (unique constraint موجود بـ migration 002).
-- لو انحذفت وحدة (soft delete) وانضافت وحدة بنفس الرقم بنفس العقار، لازم الكود يتحقق
-- من عدم وجود تعارض مع السجلات غير المحذوفة فقط (deleted_at is null) عند الإدخال.

-- ملاحظة 3 (منطق يُنفذ بكود الـ API عند إنشاء عقد جديد - POST /owner/contracts):
--   1) إدخال سجل في contracts
--   2) توليد صفوف payments تلقائياً حسب payment_cycle (شهري/ربعي/سنوي) بين start_date و end_date
--   3) تحديث units.status = 'occupied' للوحدة المرتبطة

-- ملاحظة 4 (منطق يُنفذ بكود الـ API عند POST /owner/contracts/:id/terminate):
--   1) تحديث contracts.status = 'terminated'
--   2) حذف/إلغاء أي صفوف payments بحالة 'pending' وتاريخ استحقاق مستقبلي
--   3) تحديث units.status = 'vacant'

-- ملاحظة 5 (Cron - Supabase Edge Function مجدولة يومياً):
--   ستُبنى لاحقاً كملف منفصل (Edge Function) وتُجدول عبر pg_cron أو Supabase Scheduled Triggers.
--   سنوثقها في مرحلة الـ backend logic، بعد إتمام الـ CRUD الأساسي.

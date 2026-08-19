# الإشعارات و FCM device tokens

**الحالة:** موجود وشغّال، غير مؤجّل من ناحية الكود — فقط غير مطلوب حالياً بعقد الموبايل (`docs/openapi.yaml`).

## الموجود حالياً
- `GET /api/v1/owner/notifications` — قائمة الإشعارات.
- `POST /api/v1/owner/notifications/[id]/read` — تعليم إشعار كمقروء.
- `POST /api/v1/owner/notifications/read-all` — تعليم الكل كمقروء.
- `GET/POST /api/v1/owner/device-tokens` — تسجيل device tokens لإرسال push notifications.
- `DELETE /api/v1/owner/device-tokens/[token]` — إلغاء تسجيل token.

بقيت هذه المسارات كما هي بالكامل (`/api/v1/owner/...`)، فقط تم تحديث قيم الـ enums الداخلية (`unit_status`, `payment_status`, `maintenance_status`) لتتوافق مع الـ migrations الجديدة.

## المطلوب لدمجها بعقد الموبايل مستقبلاً
- `docs/openapi.yaml` المرسل من فريق الموبايل لا يحتوي أي مسار للإشعارات أو device tokens إطلاقاً — يحتاج تأكيد من الفريق إذا كانت هذه الميزة مطلوبة بالتطبيق أصلاً قبل بناء نسخة مسطّحة منها.
- عند الحاجة: نقل المنطق لمسارات مسطّحة (`/notifications`, `/device-tokens`) بنفس نمط الـ response الجديد، مع بناء آلية إرسال push فعلية (FCM) إذا لم تكن موجودة.

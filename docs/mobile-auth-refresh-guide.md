# دليل تسجيل الدخول وتجديد الجلسة (Login + Refresh Token)

هاد الملف بيشرح كيف تتعامل مع تسجيل الدخول (`/auth/login`) والـ endpoint الجديد
لتجديد الجلسة (`/auth/refresh`) بالتطبيق (Flutter).

---

## 1. الخلفية: ليش أضفنا هاد الشغل؟

الباك اند بيستخدم Supabase Auth. لما المستخدم يسجل دخول، Supabase بيرجع نوعين
من التوكن:

| التوكن | مدته | وظيفته |
|---|---|---|
| **access token** (`token`) | قصيرة (ساعة تقريبًا) | بيتبعت مع كل request عادي كـ `Authorization: Bearer <token>` |
| **refresh token** (`refresh_token`) | طويلة (أيام/أسابيع، حسب إعدادات Supabase) | بيتستخدم **فقط** لطلب access token جديد لما القديم ينتهي |

قبل هاد التحديث، كان الـ response يرجع بس `token`. يعني لما ينتهي، المستخدم
لازم يسجل دخول من جديد بكلمة السر — تجربة مستخدم سيئة.

هلق صار الـ response يرجع كمان `refresh_token`، ومعاه endpoint جديد
(`/auth/refresh`) يستخدمه لتجديد الـ access token **بدون** طلب كلمة السر
من المستخدم من جديد.

> ⚠️ **مهم:** هاد الـ endpoint (`/auth/refresh`) مش موجود بكود Flutter الحالي —
> هو إضافة جديدة من الباك اند. لازم تدمجه بالتطبيق عشان يصير له فايدة، وإلا
> `refresh_token` اللي عم يرجع مع الـ login رح يكون بدون استخدام.

---

## 2. `POST /auth/login` — تسجيل الدخول

### Request

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "identifier": "ahmed.m@example.com",
  "password": "SecurePass123"
}
```

- `identifier`: إيميل أو رقم هاتف.
- `password`: 8 أحرف على الأقل.

### Response — نجاح (200)

```json
{
  "user_id": "4e7d4887-ce04-49e7-b193-182cbce3efb2",
  "token": "eyJhbGciOiJFUzI1NiIs...",
  "refresh_token": "calerst7khkr",
  "expires_in": 3600
}
```

- `user_id`: **string** دايمًا (حتى لو شكله UUID). ما تفترضوا إنه رقم.
- `token`: access token — JWT، بيتبعت بـ header:
  `Authorization: Bearer <token>`
- `refresh_token`: **جديد** — رمز opaque (مش JWT، مش لازم يكون بشكل معين)،
  بتخزنه وبتستخدمه بس لما الـ access token ينتهي.
- `expires_in`: **جديد** — عدد الثواني لصلاحية `token`، من لحظة إصداره
  (مثلاً `3600` = ساعة). استخدمها لحساب وقت انتهاء التوكن محليًا
  (`DateTime.now().add(Duration(seconds: expires_in))`) عشان تقدر تجدد
  التوكن **قبل** ما ينتهي (proactive)، مش بس لما يوصلك 401.

### Response — فشل

| Status | السبب |
|---|---|
| 401 | إيميل/رقم هاتف أو كلمة مرور غلط |
| 403 | الحساب موجود لكنه ليس owner (صلاحيات غير كافية) |
| 422 | بيانات الطلب غير صالحة (مثلاً identifier فاضي) |
| 500 | خطأ سيرفر |

شكل رسائل الخطأ:
```json
{ "message": "بيانات دخول غير صحيحة" }
```

---

## 3. `POST /auth/refresh` — تجديد الجلسة

### إمتى تستخدمه؟

- لما يوصلك 401 من أي request عادي (يعني الـ access token انتهى).
- أو proactively: قبل ما تعمل request مهم، إذا بتعرف إن الـ token قريب ينتهي
  (اختياري، مش ضروري).

### Request

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "calerst7khkr"
}
```

### Response — نجاح (200)

**نفس شكل response الـ login تمامًا:**

```json
{
  "user_id": "4e7d4887-ce04-49e7-b193-182cbce3efb2",
  "token": "eyJhbGciOiJFUzI1NiIs...",
  "refresh_token": "ezqynt564feh",
  "expires_in": 3600
}
```

⚠️ **مهم جدًا:** الـ `refresh_token` القديم بيصير **غير صالح** بعد أول استخدام
(Supabase بيعمل rotation). يعني لازم:

1. تستبدل `token` القديم بالجديد.
2. تستبدل `refresh_token` القديم بالجديد كمان (خزّن الجديد، احذف/تجاهل القديم).

إذا استخدمت نفس `refresh_token` مرتين، ثاني مرة رح ترجع 401.

### Response — فشل (401)

```json
{ "message": "رمز التحديث غير صالح أو منتهي" }
```

هاد معناه: الـ refresh token غير صالح، منتهي، أو استُخدم قبل هيك (rotation).
**بهاد الحالة الوحيدة اللي بيلزم فيها logout كامل** ورجوع لشاشة تسجيل الدخول.

---

## 4. التخزين المحلي (Storage)

`token` و `refresh_token` **الاثنين بيانات حساسة** — أي واحد يوصل عليهم بيقدر
ينتحل شخصية المستخدم. **ما تخزنهم بـ:**

- ❌ `shared_preferences` بشكل عادي (غير مشفر)
- ❌ متغيرات ثابتة بالكود

**خزنهم بـ:**

- ✅ `flutter_secure_storage` (Keychain على iOS، Keystore على Android)

---

## 5. تدفق الاستخدام المقترح (Flow)

```
1. المستخدم يسجل دخول (login) → خزّن token + refresh_token
                                 ↓
2. كل request عادي → Authorization: Bearer <token>
                                 ↓
3. الرد 401؟ ─── لا ──→ استمر عادي
        │
       نعم
        ↓
4. نادي /auth/refresh بالـ refresh_token المخزّن
        │
        ├─ نجح (200) → خزّن token + refresh_token الجديدين
        │              → أعد إرسال الـ request الأصلي بالـ token الجديد
        │
        └─ فشل (401) → امسح كل التوكنات المخزنة
                       → رجّع المستخدم لشاشة تسجيل الدخول
```

### تطبيق عملي مع Dio (اقتراح)

أفضل مكان لهاد المنطق هو `Interceptor` على مستوى `DioHelper`، بحيث لما أي
request يرجع 401:

1. يوقف الـ request الأصلي.
2. يستخدم `refresh_token` المخزّن لطلب token جديد من `/auth/refresh`.
3. لو نجح → يعيد إرسال الـ request الأصلي بالـ token الجديد (transparent
   للمستخدم، ما بحس بشي).
4. لو فشل → logout ويوجّه لشاشة الدخول.

**تنبيه:** لو أكتر من request صار عندهم 401 بنفس الوقت، احترس من عمل أكتر من
نداء متزامن لـ `/auth/refresh` — لأن أول نداء رح يخرّب (rotate) الـ
refresh_token، وأي نداء تاني بنفس التوكن القديم رح يفشل. الحل المعتاد: queue/lock
بحيث نداء واحد بس لـ refresh بأي وقت، والباقي يستنى نتيجته.

---

## 6. ملاحظات إضافية

- كل الحقول (`user_id`, `token`, `refresh_token`, `expires_in`) **required** بالـ response —
  لو أي واحد منهم مفقود، اعتبر الرد فشل (bug بالباك اند).
- الـ endpoint موثّق بالكامل بـ Swagger:
  `https://mandera-property-management.vercel.app/api-docs#/Auth`
- إذا في أي سلوك غير متوقع أو استفسار، تواصل معنا قبل ما تعتمد على تفاصيل
  غير موثقة هون.

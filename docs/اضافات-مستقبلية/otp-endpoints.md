# OTP: send-otp / verify-otp

**الحالة:** لم تُبنَ إطلاقاً — لا يوجد كود حالي لها.

## من الـ spec
`docs/new/openapi.yaml` يحتوي `/auth/send-otp` و `/auth/verify-otp`، لكن وصفهما بالملف نفسه يقول إنهما **غير مؤكدين** (unverified):
> defined in endpoint.dart but not referenced by any Flutter model, repository, cubit, or screen.

يعني تطبيق الموبايل الحالي (المبني على بيانات ثابتة/demo) لا يستدعي هذين المسارين فعلياً بأي مكان. الـ request/response schema الموجود بالـ spec تخمين (best-guess placeholder) وليس مستخرج من كود Dart فعلي.

## المطلوب قبل البناء
- تأكيد من فريق الموبايل: هل هذه الميزة (تحقق OTP بالهاتف/الإيميل) مطلوبة فعلاً بالتطبيق؟ وإذا نعم:
  - ما هو الـ shape الحقيقي للـ request (اسم الحقل: `identifier` أم شيء آخر؟).
  - هل الغاية verification لتسجيل حساب جديد، أو لاستعادة كلمة السر، أو لتسجيل الدخول بدون كلمة سر؟
  - أي مزوّد SMS/Email سيُستخدم لإرسال الكود فعلياً (Supabase Auth OTP يدعم هذا مباشرة عبر `signInWithOtp`).
- لا يُبنى شيء بناءً على تخمين — ينتظر تأكيد صريح من الفريق حسب توصية الـ spec نفسها.

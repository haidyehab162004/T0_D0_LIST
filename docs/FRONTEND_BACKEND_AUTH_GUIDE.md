# دليل ربط الفرونت بالباك: التسجيل وتأكيد الإيميل وتسجيل الدخول

الملف ده مرجع للخطوات اللي اتعلمناها لربط واجهة React بخدمات API في مشروع T0_D0_LIST. الشرح مركز على رحلة إنشاء الحساب، تأكيد البريد، وتسجيل الدخول، ومعاه تفسير الأخطاء اللي ظهرت وإزاي تتبعيها بنفسك.

> مهم: ما تحطيش كلمات مرور قاعدة البيانات أو Redis أو JWT_SECRET أو SMTP في ملف توثيق أو Git. خلي القيم السرية في ملفات .env المحلية فقط. الأسرار اللي اتبعتت في محادثة أو صورة لازم تتغير من لوحة الخدمة.

## 1. الفكرة العامة: الفرونت بيتكلم مع الباك إزاي؟

1. المستخدم يكتب بياناته في حقول الصفحة. React يحفظها في state مثل email وpassword.
2. عند الضغط على الزر، دالة مثل handleSubmit تمنع إعادة تحميل الصفحة وتجمع البيانات.
3. الدالة تستدعي دالة API مناسبة مثل authApi.login(credentials).
4. Axios يرسل HTTP request إلى الباك.
5. الباك يتحقق من البيانات، ينفذ العملية المطلوبة، ثم يرجع HTTP response.
6. الفرونت يتعامل مع النتيجة: يحدث user، يعرض رسالة خطأ، أو ينتقل لصفحة أخرى.

```text
حقول الصفحة → handleSubmit → authApi.js → apiRequest.js (Axios)
   → Express route → controller/service → database أو email
   ← HTTP response ← React يحدّث الحالة أو يعرض النتيجة
```

الـ credentials هي البيانات التي يرسلها الفرونت، مثل البريد وكلمة المرور. أما response فهو الرد الذي استلمه الفرونت من الباك بعد الطلب؛ ليس نسخة من مدخلات المستخدم.

## 2. الملفات المهمة في المشروع

### ملفات الفرونت

- `client/src/api/apiRequest.js`: إعداد Axios المشترك؛ فيه عنوان الباك و`withCredentials`.
- `client/src/Modules/Auth/authApi.js`: دوال استدعاء endpoints، مثل `register` و`login` و`verifyEmail`.
- `client/src/Modules/Auth/AuthContext.js`: إنشاء React Context.
- `client/src/Modules/Auth/AuthProvider.jsx`: حالة المستخدم والجلسة والدوال المشتركة مثل login وlogout.
- `client/src/Modules/Auth/useAuth.js`: hook للوصول إلى AuthContext من صفحات React.
- `client/src/Modules/MainPages/Register/RegisterForm.jsx`: يقرأ بيانات التسجيل ويرسلها.
- `client/src/Modules/MainPages/Register/components/VerifyEmail.jsx`: صفحة إدخال كود تأكيد البريد.
- `client/src/Modules/MainPages/Login/LoginForm.jsx`: يرسل بيانات تسجيل الدخول.
- `client/src/Router/router.jsx`: يعرّف الصفحات والمسارات مثل `/register` و`/verify-email` و`/login`.
- `client/src/main.jsx`: يلف التطبيق بـ AuthProvider حتى تقدر الصفحات استخدام `useAuth`.

### ملفات الباك

- `server/src/app.ts`: إعداد Express وJSON وCORS وربط المسارات.
- `server/src/server.ts`: يتصل بقاعدة البيانات وRedis ثم يبدأ السيرفر.
- `server/src/modules/auth/auth.routes.ts`: يربط عناوين HTTP بالتحقق والـ controller.
- `server/src/modules/auth/auth.validation.ts`: يتحقق من شكل البيانات المطلوبة.
- `server/src/modules/auth/auth.controller.ts` و`auth.service.ts`: منطق عمليات المصادقة.
- `server/src/integrations/email/email.service.ts`: إعداد إرسال البريد عن طريق SMTP.
- `server/src/config/env.ts`: يقرأ متغيرات البيئة مثل PORT وDATABASE_URL وSMTP.

## 3. تشغيل الفرونت والباك

افتحي نافذتين Terminal منفصلتين.

### Terminal الباك

```powershell
cd C:\Users\haidy\T0_D0_LIST\server
pnpm install
pnpm dev
```

عند النجاح تظهر رسائل مثل Database connected وRedis connected وServer running على عنوان ومنفذ. اعتمدي على المنفذ المكتوب في Terminal؛ في تشغيلنا السابق كان 3333.

### Terminal الفرونت

```powershell
cd C:\Users\haidy\T0_D0_LIST\client
pnpm install
pnpm dev
```

المشروع يحدد `pnpm` كمدير الحزم. لذلك `npm run dev` قد يعطي `EBADDEVENGINES`؛ استخدمي `pnpm dev` من مجلد المشروع الصحيح.

صفحة توثيق الباك تكون عادةً `http://localhost:3333/api-docs` إذا كان السيرفر يعمل على 3333.

## 4. عنوان API في الفرونت

ملف `client/src/api/apiRequest.js` ينشئ Axios instance، وشكله الحالي يتضمن:

```js
baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
withCredentials: true,
```

لازم قيمة `VITE_API_URL` تطابق منفذ الباك الذي ظهر في Terminal. ملف المثال في المشروع يوضح:

```env
VITE_API_URL=http://localhost:3333/api
```

ضعي القيمة في `client/.env`. بعد تعديل `.env` أوقفي Vite وشغليه من جديد. لو Network ما زال يعرض المنفذ القديم، غالبًا Vite لم يُعد تشغيله أو أن الملف في مكان غير صحيح.

الـ `baseURL` ينتهي بـ `/api`، ولذلك عندما تستدعي `authApi.login` المسار `/auth/login` يصبح العنوان الكامل:

```text
http://localhost:3333/api/auth/login
```

## 5. إعداد الباك والبريد المحلي Mailpit

ملف `server/.env` يحتوي متغيرات بيئة يحتاجها الباك. أسماء المتغيرات المهمة:

```env
PORT=3333
CLIENT_URL=http://localhost:5173
DATABASE_URL=...
REDIS_URL=...
JWT_SECRET=...
AUTH_COOKIE_NAME=auth_token
SMTP_HOST=127.0.0.1
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=todo@localhost
```

علامات `...` للتوضيح فقط؛ خدي قيم قاعدة البيانات وRedis وJWT من مصدرها، ولا تنسخيها من هذا الملف.

إعداد SMTP أعلاه معناه أن الباك يحاول إرسال البريد لخدمة محلية، وليس إلى Gmail. Mailpit يمسك رسائل الاختبار محليًا:

1. نزلي نسخة Windows المناسبة من Mailpit وفكي ضغطها.
2. شغلي `mailpit.exe` واتركيه يعمل أثناء الاختبار.
3. افتحي `http://localhost:8025` لمشاهدة الرسائل.
4. Mailpit يستقبل SMTP عادة على المنفذ `1025` وواجهة عرض الرسائل على `8025`.

لو ظهر `ECONNREFUSED 127.0.0.1:1025`، فالباك لم يجد خدمة SMTP تعمل على هذا المنفذ. شغلي Mailpit ثم أعيدي طلب إرسال الكود. مع هذا الإعداد، الكود يظهر في واجهة Mailpit وليس في Gmail.

## 6. رحلة إنشاء الحساب وتأكيد البريد

### 6.1 إنشاء الحساب

في `RegisterForm.jsx`، `handleSubmit` يتحقق أولًا أن كلمة المرور وتأكيدها متطابقان. بعدها يستدعي:

```js
await authApi.register({ name, email, password });
navigate('/verify-email', { state: { email } });
```

دالة `register` في `authApi.js` ترسل `POST /auth/register`. الباك يستقبل JSON يحتوي `name` و`email` و`password`. إذا رجع نجاح، ينتقل React لصفحة `/verify-email` ويحمل البريد في navigation state.

### 6.2 الحصول على الكود

بعد نجاح التسجيل، افتحي Mailpit على `http://localhost:8025` وابحثي عن الرسالة. الكود للاستخدام في تأكيد البريد. إذا لم تظهر رسالة:

- راجعي أن Mailpit يعمل.
- راجعي Terminal الباك عند لحظة التسجيل.
- تحققي من إعداد SMTP في `server/.env`.

### 6.3 إرسال كود التحقق

المسار هو:

```text
POST http://localhost:3333/api/auth/verify-email
```

وجسم الطلب المتوقع:

```json
{
  "email": "البريد المستخدم في التسجيل",
  "otp": "123456"
}
```

الكود عادةً ستة أرقام كنص. `VerifyEmail.jsx` يرسل `{ email, otp }` إلى دالة التحقق.

الصفحة تستخرج البريد هكذا:

```js
const location = useLocation();
const email = location.state?.email;
```

لهذا افتحي الصفحة بعد التسجيل عن طريق `navigate` أعلاه. لو كتبتي `/verify-email` يدويًا أو عملتِ refresh، قد يختفي البريد لأن navigation state لا يُحفظ كرابط. إذا ظهر `email` فارغًا، ارجعي لصفحة التسجيل أو أضيفي حقل بريد للصفحة.

### 6.4 إعادة إرسال كود التحقق

المسار:

```text
POST http://localhost:3333/api/auth/resend-verification-otp
```

والجسم:

```json
{ "email": "البريد المستخدم في التسجيل" }
```

الرد `200` قد يكون عامًا لحماية خصوصية الحسابات، فلا يثبت وحده أن الرسالة وصلت. تأكدي من ظهور الرسالة في Mailpit.

### 6.5 كود تأكيد البريد غير كود نسيان كلمة المرور

- تأكيد البريد بعد التسجيل: `/auth/verify-email`.
- كود استعادة كلمة المرور: يبدأ من `/auth/forgot-password` ويتحقق عبر `/auth/verify-reset-otp`.

هما عمليتان منفصلتان، فلا تستخدمي كود استعادة كلمة المرور في صفحة تأكيد الحساب.

## 7. رحلة تسجيل الدخول والجلسة

في `LoginForm.jsx` يتم استدعاء:

```js
await login({ email, password });
navigate('/dashboard');
```

`login` هنا دالة Frontend داخل `AuthProvider`. تستدعي `authApi.login(credentials)`، والـ API يرسل `POST /api/auth/login`. عند النجاح، تحفظ `AuthProvider` المستخدم في state عبر `setUser`، ثم تنتقل الصفحة إلى Dashboard.

عند فتح التطبيق، `useEffect` في `AuthProvider` ينفذ `authApi.getMe()` لفحص الجلسة الحالية. لو الرد نجح، يحفظ المستخدم؛ ولو فشل، يضع `user` على `null`. الـ Context يجعل الحالة متاحة للصفحات التي تستخدم `useAuth()`.

الباك ينشئ جلسة ويرسل HttpOnly cookie. JavaScript لا يقرأ قيمة هذا النوع من الكوكيز مباشرةً، لكن المتصفح يرسلها تلقائيًا. لهذا Axios يحتوي `withCredentials: true`، والباك يسمح بالـ credentials في CORS. قيمة `CLIENT_URL` في الباك يجب أن تطابق عنوان الفرونت، غالبًا `http://localhost:5173`.

## 8. ملاحظة مهمة عن VerifyEmail في الكود الحالي

في الملفات التي راجعناها، `VerifyEmail.jsx` يستدعي `useAuth()` لكن لا يظهر import له. يجب استيراده من:

```js
import { useAuth } from '../../../Auth/useAuth.js';
```

كذلك `AuthProvider.jsx` الحالي يمرر `login` و`googleLogin` و`logout` و`refreshUser`، لكنه لا يمرر `verifyEmail`. لذلك حتى بعد إضافة import، `verifyEmail` لن تكون موجودة في قيمة الـ Context إلى أن تُعرّف دالة تستدعي `authApi.verifyEmail(data)` داخل `AuthProvider` وتضيفها إلى `value`.

هذا هو النقص الحالي الذي يمنع تدفق تأكيد البريد من العمل عبر `useAuth`. أضيفي الدالة ومرريها في Context ثم جرّبي. ملف التوثيق فقط هو الذي تم إنشاؤه؛ لم أعدّل كود التطبيق ضمن طلب إعداد هذا الدليل.

## 9. تفسير الأخطاء التي ظهرت

- `EBADDEVENGINES` مع npm: المشروع يطلب pnpm. شغلي `pnpm install` ثم `pnpm dev`.
- `Missing required environment variable`: متغير مطلوب غير موجود في `server/.env`. أضيفي الاسم المطلوب بقيمة صحيحة ثم أعيدي تشغيل الباك.
- `ECONNREFUSED 127.0.0.1:1025`: خدمة SMTP المحلية غير شغالة أو المنفذ غير مطابق. شغلي Mailpit.
- `401 Unauthorized` عند login: البريد/كلمة المرور غير صحيحين، أو الحساب غير مؤكد وفق منطق الباك. افحصي بيانات الحساب وحالة تأكيده.
- `409 Conflict` عند register: البريد موجود مسبقًا. استخدمي بريدًا جديدًا أو أعيدي إرسال كود التحقق/سجلي الدخول بدل التسجيل من جديد.
- `429 Too Many Requests` أو `RATE_LIMITED`: محاولات كثيرة خلال فترة قصيرة. انتظري ثم أعيدي المحاولة مرة واحدة.
- `500 Internal Server Error`: خطأ أثناء تنفيذ الباك أو الاتصال بخدمة. راقبي Terminal الباك في نفس لحظة الطلب.
- الطلب يذهب إلى `localhost:3000` بدل `3333`: قيمة `VITE_API_URL` غير موجودة أو Vite لم يُعد تشغيله بعد تعديلها.
- `authApi is not defined` أو `useAuth is not defined`: اسم مستخدم من دون import صحيح.

### لماذا ظهر 409 بعد مشكلة إرسال البريد؟

قد يضيف الباك الحساب إلى قاعدة البيانات ثم يفشل إرسال رسالة التحقق. محاولة التسجيل التالية بنفس البريد تكتشف أن الحساب موجودًا فترد بـ 409. في هذه الحالة استخدمي endpoint إعادة إرسال التحقق بعد تشغيل Mailpit، ولا تعيدي إنشاء الحساب بنفس البريد.

## 10. تتبع الطلب بنفسك من المتصفح

1. افتحي أدوات المطور بـ `F12` ثم تبويب **Network**.
2. اضغطي زر التسجيل أو الدخول أو التحقق.
3. اختاري الطلب الذي يحتوي `auth/`.
4. افحصي **Request URL** للتأكد من المنفذ.
5. افحصي **Payload** للتأكد من إرسال الحقول المطلوبة.
6. افحصي **Status Code** و**Response** لمعرفة ما أجاب به الباك.
7. عند `500`، راجعي Terminal الباك في نفس التوقيت.

إذا لم يظهر request أصلًا، فالمشكلة غالبًا في الزر أو `onSubmit` أو خطأ JavaScript قبل الإرسال. إذا كان العنوان أو payload خطأ، راجعي إعدادات الفرونت. إذا كان الرد 4xx، اقرأِي رسالة الباك والحقول المطلوبة. إذا كان 500، راجعي Terminal الباك والخدمات التي يعتمد عليها.

## 11. قائمة اختبار التسجيل من البداية للنهاية

- [ ] Terminal الباك يعرض المنفذ المتوقع.
- [ ] Terminal الفرونت يعرض رابط Vite.
- [ ] `client/.env` يشير إلى نفس منفذ الباك وينتهي بـ `/api`.
- [ ] Mailpit شغال إذا كان SMTP مضبوطًا على `127.0.0.1:1025`.
- [ ] جربي بريدًا جديدًا غير مستخدم.
- [ ] طلب `/api/auth/register` يرجع نجاحًا.
- [ ] صفحة Verify Email تعرض البريد الصحيح.
- [ ] الرسالة ظاهرة في `http://localhost:8025`.
- [ ] طلب `/api/auth/verify-email` يرسل البريد والكود ويرجع نجاحًا.
- [ ] سجلي الدخول بعد تأكيد الحساب وتحققي من فتح Dashboard.

## 12. خلاصة سريعة

- الفرونت يجمع المدخلات ويرسلها؛ الباك يتحقق منها وينفذ العمل.
- `credentials` هي بيانات الطلب، و`response` هو رد الباك.
- `setUser` تحفظ المستخدم في حالة React المشتركة بعد نجاح الدخول.
- `withCredentials: true` يسمح بإرسال كوكي الجلسة مع الطلبات.
- Mailpit واجهة بريد اختبار محلية: SMTP على 1025 وواجهة الرسائل على 8025.
- افحصي Network لمعرفة العنوان والبيانات والرد، وTerminal الباك لتفاصيل أخطاء 500.
- لا تحفظي الأسرار في README أو Git.

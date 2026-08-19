# المساعد الأكاديمي الذكي — University AI Assistant

مساعد أكاديمي ذكي مبني على تقنية RAG (الاسترجاع المعزز بالتوليد)، يجيب على
أسئلة الطلاب اعتمادًا على ملفات PDF الخاصة بالمقررات الدراسية، بواجهة عربية
(RTL) بالكامل.

**تم التطوير بواسطة: داوود حسن ظافر (مندوب الدفعة / علوم حاسوب)**

---

## 🧱 التقنيات المستخدمة

| الطبقة   | التقنية                                                   |
| -------- | ---------------------------------------------------------- |
| Backend  | Node.js, Express.js, LangChain, Google Gemini 1.5 Flash    |
| Database | Supabase (PostgreSQL + pgvector + Auth)                    |
| Frontend | React (Vite), Tailwind CSS, RTL                             |
| Deploy   | Vercel (frontend) + Railway / Render (backend)              |

---

## 📁 بنية المشروع

```
university-ai-assistant/
├── server/                 # Express backend
│   └── src/
│       ├── config/         # Supabase & Gemini clients
│       ├── middleware/     # auth, adminAuth, rateLimiter, errorHandler
│       ├── routes/         # upload, files, chat, students, courses
│       ├── controllers/    # request handlers
│       ├── services/       # pdf, embedding, gemini, rag pipeline
│       └── utils/          # text chunker, zod validators
├── client/                 # React (Vite) frontend
│   └── src/
│       ├── components/     # Login, OnboardingModal, Sidebar, Chat, Header, Footer, AdminUploadPanel
│       ├── hooks/          # useAuth
│       └── lib/            # supabaseClient, api
├── supabase/
│   └── schema.sql          # tables, pgvector index, match_documents(), RLS policies
├── .env.example             # backend environment variables
└── README.md
```

---

## ⚙️ 1. إعداد Supabase

1. أنشئ مشروعًا جديدًا على [supabase.com](https://supabase.com).
2. من **SQL Editor**، شغّل محتوى الملف `supabase/schema.sql` بالكامل. هذا
   ينشئ الجداول (`courses`, `students`, `documents`, `chat_logs`)، دالة
   `match_documents()` للبحث المتجهي، والفهارس، وسياسات RLS.
3. من **Authentication → Providers**، فعّل **Google** وأدخل بيانات OAuth
   الخاصة بك (Client ID / Secret من Google Cloud Console).
4. من **Project Settings → API**، انسخ:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (سري، للباك اند فقط)
   - `anon` key → `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY`

---

## ⚙️ 2. إعداد المتغيرات البيئية

انسخ `.env.example` إلى `server/.env` وعدّل القيم:

```bash
cp .env.example server/.env
```

ثم انسخ `client/.env.example` إلى `client/.env`:

```bash
cp client/.env.example client/.env
```

أهم المتغيرات:

| المتغير                    | الوصف                                              |
| --------------------------- | --------------------------------------------------- |
| `SUPABASE_URL`               | رابط مشروع Supabase                                  |
| `SUPABASE_SERVICE_ROLE_KEY`  | مفتاح الخدمة (سري، لا يُستخدم في الواجهة الأمامية) |
| `GEMINI_API_KEY`             | مفتاح Google Gemini API                              |
| `ADMIN_UPLOAD_SECRET`        | كلمة سر لحماية رفع الملفات (`/api/upload`)         |
| `VITE_SUPABASE_URL`          | نفس رابط Supabase (للواجهة الأمامية)                |
| `VITE_SUPABASE_ANON_KEY`     | مفتاح anon العام (للواجهة الأمامية)                 |
| `VITE_API_BASE_URL`          | رابط الباك اند، مثال: `http://localhost:5000/api`   |

---

## 🚀 3. تشغيل الباك اند (Backend)

```bash
cd server
npm install
npm run dev      # للتطوير (nodemon)
# أو
npm start        # للإنتاج
```

الخادم يعمل افتراضيًا على `http://localhost:5000`.
تحقق من عمله عبر: `GET http://localhost:5000/api/health`

---

## 🚀 4. تشغيل الواجهة الأمامية (Frontend)

```bash
cd client
npm install
npm run dev
```

الواجهة تعمل افتراضيًا على `http://localhost:5173`.

---

## 🔌 5. واجهات API (Backend Endpoints)

| Method | Endpoint                | الحماية                          | الوصف                          |
| ------ | ------------------------ | --------------------------------- | -------------------------------- |
| GET    | `/api/health`            | عام                                | فحص حالة الخادم                |
| POST   | `/api/students/onboard`  | مستخدم مسجل                       | ربط الرقم الأكاديمي بالحساب   |
| GET    | `/api/students/me`       | مستخدم مسجل                       | جلب بيانات الطالب الحالي       |
| GET    | `/api/courses`           | مستخدم مسجل                       | قائمة المقررات                  |
| POST   | `/api/upload`             | `X-Upload-Secret` (المسؤول فقط) | رفع ومعالجة ملف PDF            |
| GET    | `/api/files`              | مستخدم مسجل                       | قائمة الملفات المفهرسة         |
| DELETE | `/api/files/:id`          | `X-Upload-Secret` (المسؤول فقط) | حذف ملف وجميع مقاطعه          |
| POST   | `/api/chat`               | مستخدم مسجل                       | إرسال سؤال (`?stream=true` للبث المباشر) |

---

## 🧠 6. آلية عمل RAG

1. يتم استخراج نص PDF (`pdf-parse`) وتنظيفه وتقسيمه إلى مقاطع متداخلة.
2. يتم توليد تمثيل متجهي (embedding) لكل مقطع عبر Gemini
   `text-embedding-004` (768 بُعد) وتخزينه في `documents.embedding`.
3. عند طرح سؤال: يُحوَّل السؤال إلى متجه، ثم يُجرى بحث هجين (Hybrid
   Search) يجمع بين تشابه المتجهات (`match_documents` عبر pgvector)
   والبحث النصي، ثم تُعاد ترتيب النتائج (re-rank) لاختيار أفضل
   `top-k` مقاطع.
4. تُبنى رسالة السياق وتُرسل إلى Gemini 1.5 Flash مع تعليمات نظام
   تجعله يتصرف كأستاذ جامعي خبير، ويرفض التخمين إذا لم يجد الإجابة
   في المواد المرفوعة.
5. تُخزَّن الإجابة في `chat_logs` وتُعرض مع المصادر (اسم الملف + مقتطف).

---

## 🛡️ 7. الأمان

- `helmet` لرؤوس HTTP الآمنة.
- `cors` مقيّد بمصدر الواجهة الأمامية فقط (`CLIENT_URL`).
- تحديد معدل الطلبات (`express-rate-limit`) لكل الـ API، وحد أشد على `/api/chat`.
- التحقق من صحة المدخلات عبر `zod` في جميع المسارات.
- حماية مسار الرفع بمفتاح `X-Upload-Secret` منفصل عن مصادقة المستخدم العادية.
- التحقق من JWT الخاص بـ Supabase على كل مسار محمي عبر `verifyUser`.
- Row Level Security مفعّلة على جداول Supabase الحساسة.

---

## ☁️ 8. النشر (Deployment)

**Backend → Railway / Render**

- اربط مستودع Git، وحدد `server` كجذر المشروع (Root Directory).
- أضف جميع متغيرات البيئة من `.env.example`.
- أمر التشغيل: `npm start`.

**Frontend → Vercel**

- حدد `client` كجذر المشروع.
- أمر البناء: `npm run build`، مجلد الإخراج: `dist`.
- أضف متغيرات `VITE_*` من `client/.env.example`.
- بعد النشر، حدّث `CLIENT_URL` في متغيرات الباك اند لتطابق رابط Vercel.

---

## 📌 ملاحظات

- تأكد من أن `ADMIN_UPLOAD_SECRET` قوي وسري، فهو الحاجز الوحيد أمام رفع
  ملفات غير مصرح بها.
- `SUPABASE_SERVICE_ROLE_KEY` يجب أن يبقى في الباك اند فقط ولا يُستخدم
  إطلاقًا في كود الواجهة الأمامية.
- يدعم `/api/chat?stream=true` البث المباشر (Server-Sent Events) لعرض
  الإجابة أثناء توليدها.




// // server.js
// const express = require('express');
// const next = require('next');
// const path = require('path');
// const axios = require('axios');  // لجلب البيانات من API

// // أعدّ مشاريع Next.js
// const nextApp1 = next({ dev: false, dir: path.join(__dirname, 'RTL-Version-1') });
// const handle1 = nextApp1.getRequestHandler();

// const nextApp2 = next({ dev: false, dir: path.join(__dirname, 'RTL-Version-2') });
// const handle2 = nextApp2.getRequestHandler();

// Promise.all([
//   nextApp1.prepare(),
//   nextApp2.prepare()
// ]).then(() => {
//   const server = express();

//   // دالة مساعد تسأل API: "/domain?hostname=..."
//   async function getScriptForDomain(hostname) {
//     try {
//       // نفترض أن API لدينا على http://localhost:4000
//       const resp = await axios.get(`http://localhost:4000/domain?hostname=${hostname}`);
//       return resp.data.script;  // يرجع "RTL-Version-1" أو ...
//     } catch (err) {
//       console.error("Error calling API:", err.message);
//       // لو فشل الطلب لأي سبب, ممكن أن نرجع قيمة افتراضية:
//       return "RTL-Version-1";
//     }
//   }

//   server.all('*', async (req, res) => {
//     const hostname = req.hostname.toLowerCase();  

//     // نسأل API عن اسم السكربت
//     const projectDir = await getScriptForDomain(hostname);
    
//     if (projectDir === 'RTL-Version-1') {
//       return handle1(req, res);
//     } else if (projectDir === 'RTL-Version-2') {
//       return handle2(req, res);
//     } else {
//       // لو أعاد أي قيمة أخرى أو لا تعرفه
//       return res.status(404).send(`<h1>Not found for domain "${hostname}"</h1>`);
//     }
//   });

//   server.listen(3008, () => {
//     console.log('Main server running on http://localhost:3008');
//   });
// }).catch(err => {
//   console.error('Error preparing Next apps:', err);
//   process.exit(1);
// });



// server.js

// +ـ+ــ+ـ+ــ
// server.js

// const express = require('express');
// const next = require('next');
// const path = require('path');
// const axios = require('axios');

// // إعداد مشاريع Next.js
// const nextApp1 = next({ dev: false, dir: path.join(__dirname, '../base-script-1') });
// const handle1 = nextApp1.getRequestHandler();

// const nextApp2 = next({ dev: false, dir: path.join(__dirname, '../RTL-Version-2') });
// const handle2 = nextApp2.getRequestHandler();

// Promise.all([
//   nextApp1.prepare(),
//   nextApp2.prepare()
// ])
//   .then(() => {
//     const server = express();

//     server.use(express.json());

//     // دالة جلب اسم السكربت المناسب للدومين
//     async function getScriptForDomain(hostname) {
//       try {
//         const resp = await axios.post(`https://localhost:3000/api/user/getScriptInfo`, {
//           websiteUrl: hostname
//         });

//         return resp.data.scriptNamePaidDomain;

//       } catch (err) {
//         console.error("Error calling API:", err.message);
//         return null; // عودة null في حالة الخطأ
//       }
//     }

//     // جميع الطلبات تمر من هنا
//     server.all('*', async (req, res) => {
//       const hostname = req.hostname.toLowerCase();
//       const projectDir = await getScriptForDomain(hostname);

//       if (projectDir === 'base-script-1') {
//         return handle1(req, res);
//       } else if (projectDir === 'RTL-Version-2') {
//         return handle2(req, res);
//       } else {
//         return res.status(404).send(`<h1>الرابط "${hostname}" غير مسجل</h1>`);
//       }
//     });

//     server.listen(3008, () => {
//       console.log('Main server running on http://localhost:3008');
//     });
//   })
//   .catch(err => {
//     console.error('Error preparing Next apps:', err);
//     process.exit(1);
//   });




// server.js

const express = require('express');
const next = require('next');
const path = require('path');
const axios = require('axios');
require('dotenv').config(); // لتحميل متغيرات البيئة من ملف .env

// إعداد مشاريع Next.js
const nextApp1 = next({ dev: false, dir: path.join(__dirname, '../base-script-1') });
const handle1 = nextApp1.getRequestHandler();

const nextApp2 = next({ dev: false, dir: path.join(__dirname, '../RTL-Version-2') });
const handle2 = nextApp2.getRequestHandler();

Promise.all([
  nextApp1.prepare(),
  nextApp2.prepare()
])
  .then(() => {
    const server = express();

    server.use(express.json());

    // الدالة المسؤولة عن جلب السكربت المناسب للدومين
    async function getScriptForDomain(hostname) {
      try {
        const apiUrl = process.env.API_BASE_URL || 'http://localhost:3000'; // من .env أو قيمة افتراضية
        const resp = await axios.post(`${apiUrl}/api/user/getScriptInfo`, {
          websiteUrl: hostname
        });

        if (!resp.data || !resp.data.scriptNamePaidDomain) {
          console.error(`❌ API returned no script for "${hostname}". Check API logic.`);
          return null;
        }

        return resp.data.scriptNamePaidDomain;

      } catch (err) {
        console.error(`❌ API request failed for "${hostname}" → ${err.message}`);
        return null;
      }
    }

    // التعامل مع جميع الطلبات
    server.all('*', async (req, res) => {
      const hostname = req.hostname.toLowerCase();
      const projectDir = await getScriptForDomain(hostname);

      if (projectDir === 'base-script-1') {
        return handle1(req, res);
      } else if (projectDir === 'RTL-Version-2') {
        return handle2(req, res);
      } else {
        console.warn(`⚠️ No matching script found for "${hostname}".`);
        return res.status(404).send(`<h1>الرابط "${hostname}" غير مسجل أو يوجد خطأ في API</h1>`);
      }
    });

    server.listen(3008, () => {
      console.log('✅ Main server running on http://localhost:3008');
    });
  })
  .catch(err => {
    console.error('❌ Error preparing Next apps:', err);
    process.exit(1);
  });

# 🧞‍♂️ المارد الأزرق — خلّ الذكاء الاصطناعي يحقق أمنيتك

تجربة عربية RTL للموظفين + Groq AI + PostgreSQL + Admin Dashboard محمي.

## Environment Variables
- DATABASE_URL
- GROQ_API_KEY
- GROQ_MODEL=llama-3.3-70b-versatile
- ADMIN_EMAIL
- ADMIN_PASSWORD_HASH
- SESSION_SECRET

## تشغيل محلي
1. npm install
2. npx prisma generate
3. npx prisma db push
4. npm run dev

## Railway
1. Deploy from this GitHub repository.
2. Add PostgreSQL.
3. Configure the environment variables above.
4. Pre-deploy command: npx prisma db push
5. Build: npm run build
6. Start: npm start
7. Generate a public domain.

The public experience is at / and the protected dashboard is at /admin.
Never commit GROQ_API_KEY or passwords to GitHub.

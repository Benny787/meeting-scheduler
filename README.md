# Meeting Scheduler – Real-Time Calendar Availability

A modern, collaborative meeting scheduling platform that aggregates **Google Calendar** availability from all participants in a session and visually displays **when everyone is free vs. when anyone is busy**.

This project is built with **Next.js 15**, styled with **Tailwind CSS**, powered by **Prisma ORM**, and backed by **NextAuth.js** for secure authentication. It is designed for real-time, multi-user availability planning, with future deployment plans on **AWS**.

---

## 📌 Features

- **Google Calendar Integration**  
  Automatic calendar connection on first sign-in using Google OAuth2 with offline access and refresh tokens.

- **Aggregated Availability View**  
  Displays a **7-day rolling grid** in 30-minute blocks from **8:00 AM – 8:00 PM**.  
  - Green = All participants free  
  - Gray = At least one participant busy  
  - (Planned) Show busy counts & darker shading based on number busy.

- **Real-Time Collaboration**  
  When multiple users join the same session, availability is aggregated and updated for everyone.

- **Secure Authentication**  
  - NextAuth.js with Google provider  
  - Prisma Adapter for database persistence  
  - JWT sessions with refresh token handling

- **Database Layer**  
  SQLite in local dev; easy migration to **PostgreSQL on AWS RDS** for production.

---

## 🛠 Tech Stack

| Category        | Technology |
|-----------------|------------|
| Framework       | [Next.js 15](https://nextjs.org/) |
| Styling         | [Tailwind CSS](https://tailwindcss.com/) |
| ORM & Database  | [Prisma](https://prisma.io/) + SQLite (local), PostgreSQL planned for AWS |
| Authentication  | [NextAuth.js](https://next-auth.js.org/) |
| API Layer       | Next.js Route Handlers |
| Calendar API    | [Google Calendar API](https://developers.google.com/calendar) |
| Hosting (future)| AWS (Amplify or ECS + RDS) |

---

## 🚀 Deployment Plan (AWS)

1. **Frontend** → Deploy with **AWS Amplify** or **Vercel** for simplicity.
2. **Backend APIs** →  
   - Option 1: Keep serverless APIs with Next.js on Amplify.  
   - Option 2: Move API routes to **AWS Lambda** (via SST or Serverless Framework).
3. **Database** →  
   - Migrate from SQLite to **PostgreSQL on AWS RDS**.  
   - Update `DATABASE_URL` in `.env`.
4. **Environment Variables** → Store in AWS Secrets Manager or Parameter Store.
5. **Google OAuth Credentials** → Update `NEXTAUTH_URL` in Google Cloud Console to production domain.

---

## ⚙️ Setup & Development

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/meeting-scheduler.git
cd meeting-scheduler
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create .env.local
```bash
NEXT_PUBLIC_BASE_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=your-random-secret
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL="file:./dev.db"
```

### 4. Set up the database
```bash
npx prisma migrate dev --name init
```

### 5. Run teh app
```bash
npm run dev
```

---

## 📈 Roadmap

- AWS deployment with RDS PostgreSQL

- Live updates via WebSockets or Next.js Server Actions

- “Busy count” shading for blocks

- Outlook Calendar integration

- Session chat & notes

- Time zone handling for global teams

---

## 📄 License

MIT License © 2025 Benjamin Manicke


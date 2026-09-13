# Surata

A comprehensive platform for Indian students — jobs, internships, exams, hackathons, scholarships, and more.

## Tech Stack

- **Framework:** Next.js 16 + React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Scraping:** Cheerio (server-side HTML parsing)
- **Deployment:** Vercel

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/           # Pages and API routes
  components/    # Shared UI components
  hooks/         # Custom React hooks
  lib/           # Scrapers and utilities
  types/         # TypeScript interfaces
```

## API Routes

| Route | Description |
|-------|-------------|
| `/api/jobs` | Government job listings |
| `/api/privateJobs` | Private sector jobs |
| `/api/live` | Live results, admit cards, answer keys |
| `/api/liveInternships` | Internship listings |
| `/api/liveScholarships` | Scholarship listings |
| `/api/liveHackathons` | Hackathon listings |
| `/api/sarkari` | SarkariResult data |
| `/api/updates` | Combined updates feed |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CRON_SECRET` | Yes | Auth token for `/api/cron` endpoint |

## License

Private — All rights reserved.

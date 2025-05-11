# Psych-bolt

## Setup

1. Copy `.env.example` to `.env` and fill in your Supabase credentials

2. Configure Supabase CORS settings:
   - Go to Supabase → Project Settings → API → Allowed Origins
   - Add the following origins:
     - `https://*.netlify.app` (for Netlify deployments)
     - Your custom domain if using one

3. Install dependencies and start the dev server:
   ```bash
   npm install
   npm run dev
   ```

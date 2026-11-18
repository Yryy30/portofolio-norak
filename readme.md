# portofolio-norak

A retro 2000s-style personal portfolio: BIOS boot screen, Windows XP loading, Windows 98 windows, marquees, and a cursor trail. Content is dynamic and editable from a private admin panel.

Built for fun and nostalgia, and as a playground for learning new technologies.

## Tech Stack

- **Frontend:** Svelte 5, Vite, TypeScript
- **Backend:** Hono on Cloudflare Workers
- **Database:** Cloudflare D1 (SQLite)
- **Storage:** Cloudflare R2 (project images)
- **Package manager:** pnpm

## Features

- Boot sequence: power on, BIOS, Windows XP loading, then the site
- Win98-style pages: Home, About, Projects, Contact
- Draggable retro modal with an image gallery for project details
- Dynamic content (home text, skills, projects, contact links) stored in D1
- Admin panel at `/admin` (single admin, password login with a JWT cookie)
- Image upload to R2 (cover and gallery per project)

## Project Structure

```
migrations/   D1 schema and seed
shared/       Types shared by worker and frontend
src/          Svelte app (site, admin, styles)
worker/       Hono API (public, admin, media routes)
```

## Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create the D1 database and the R2 bucket:

   ```bash
   pnpm wrangler d1 create portofolio-norak-db
   pnpm wrangler r2 bucket create portofolio-norak-media
   ```

3. Put the returned `database_id` into `wrangler.jsonc`.

4. Create `.dev.vars` for local development:

   ```
   ADMIN_PASSWORD=your-password
   JWT_SECRET=a-long-random-string
   ```

5. Apply the migrations locally:

   ```bash
   pnpm wrangler d1 migrations apply portofolio-norak-db --local
   ```

6. Start the dev server:

   ```bash
   pnpm dev
   ```

The site runs at the URL shown by Vite, and the admin panel is at `/admin`.

The seed data is placeholder content. Replace it from the admin panel.

## Scripts

| Command        | Description                         |
| -------------- | ----------------------------------- |
| `pnpm dev`     | Start the dev server                |
| `pnpm build`   | Build for production                |
| `pnpm preview` | Preview the production build        |
| `pnpm check`   | Type-check the frontend and worker  |
| `pnpm deploy`  | Build and deploy to Cloudflare      |

## Deploy

1. Apply the migrations to the remote database:

   ```bash
   pnpm wrangler d1 migrations apply portofolio-norak-db --remote
   ```

2. Set the secrets:

   ```bash
   pnpm wrangler secret put ADMIN_PASSWORD
   pnpm wrangler secret put JWT_SECRET
   ```

3. Deploy:

   ```bash
   pnpm deploy
   ```

===============================================================================
PINBOARD - an image saving & sharing app
Change++ Coding Challenge
===============================================================================

Anikait Rawat
anikait.rawat@vanderbilt.edu

-------------------------------------------------------------------------------
WHAT IT IS
-------------------------------------------------------------------------------

Pinboard lets you search millions of free images, save the ones you like into
boards you create, annotate them with notes, and share a board either as a
public read-only link or with another account as a collaborator who can edit it
alongside you.

-------------------------------------------------------------------------------
TECH STACK
-------------------------------------------------------------------------------

Frontend    React 19 + TypeScript, built with Vite
            Tailwind CSS v4, React Router, axios, lucide-react icons

Backend     Node.js + Express + TypeScript (runs as its own server on port 4000)
            Zod for request validation, JWT + bcrypt for authentication

Database    PostgreSQL, accessed through Prisma ORM

Images      Pixabay API, proxied through the backend so the API key never
            reaches the browser

-------------------------------------------------------------------------------
HOW TO RUN IT
-------------------------------------------------------------------------------

Prerequisites: Node.js 18+ and PostgreSQL installed and running.

1. Install PostgreSQL and create the database

     brew install postgresql@17
     brew services start postgresql@17
     createdb pinboard

2. Install dependencies (two separate packages)

     npm install --prefix server
     npm install --prefix client

3. Configure the backend

   Copy server/.env.example to server/.env and fill it in:

     DATABASE_URL="postgresql://YOUR_MAC_USERNAME@localhost:5432/pinboard"
     JWT_SECRET="any-long-random-string"
     PORT=4000
     CLIENT_ORIGIN="http://localhost:5173"
     PIXABAY_API_KEY="your-key-here"

   A free Pixabay key takes about a minute to get:
   https://pixabay.com/accounts/register/  ->  https://pixabay.com/api/docs/

   Without the key everything works except image search, which will show a
   message telling you the key is missing.

4. Create the database tables

     npm run db:push --prefix server

5. Start both servers in two separate terminal tabs

     npm run dev --prefix server     (API  -> http://localhost:4000)
     npm run dev --prefix client     (Web  -> http://localhost:5173)

6. Open http://localhost:5173 and create an account.

Useful extra: "npm run db:studio --prefix server" opens a browser GUI for
inspecting the database contents.

-------------------------------------------------------------------------------
API ENDPOINTS
-------------------------------------------------------------------------------

All routes are prefixed with /api. Routes marked [auth] require an
"Authorization: Bearer <token>" header.

  Authentication
    POST   /api/auth/register                   create an account
    POST   /api/auth/login                      sign in, returns a JWT
    GET    /api/auth/me                 [auth]  restore the current session

  Boards
    GET    /api/collections             [auth]  boards I own + shared with me
    POST   /api/collections             [auth]  create a board
    GET    /api/collections/:id         [auth]  one board and its images
    PATCH  /api/collections/:id         [auth]  rename / describe / visibility
    DELETE /api/collections/:id         [auth]  delete a board

  Images in a board
    POST   /api/collections/:id/images                  [auth]  save an image
    PATCH  /api/collections/:id/images/:imageId         [auth]  edit note/tags
    DELETE /api/collections/:id/images/:imageId         [auth]  remove image

  Sharing
    GET    /api/share/:slug                             public read-only view
    POST   /api/collections/:id/collaborators           [auth]  invite a user
    DELETE /api/collections/:id/collaborators/:userId   [auth]  revoke access

  Search
    GET    /api/search?q=term&page=1    [auth]  proxied Pixabay image search

  Health
    GET    /api/health                          server status check

-------------------------------------------------------------------------------
HOW THE REQUIREMENTS ARE MET
-------------------------------------------------------------------------------

  Create boards/collections ....... "New board" on the home page, or create one
                                    inline while saving an image
  Search for content .............. Discover page, backed by the Pixabay API
  Save/edit content ............... Save to any board; notes are editable in
                                    place on each saved image
  Remove content .................. Trash icon on any saved image
  View collections ................ Home page grid, split into boards you own
                                    and boards shared with you
  Separate backend server ......... Express on :4000, React on :5173
  Database ........................ PostgreSQL via Prisma (4 tables)

Extra features beyond the base spec:

  - User accounts with JWT auth and bcrypt-hashed passwords
  - Collaboration: invite another account by username or email to co-edit
  - Public/private toggle per board with an unguessable share link
  - Optimistic UI: saves, removals and note edits appear instantly and roll
    back automatically if the server rejects them
  - Lazy-loaded images with skeleton placeholders sized to each image's real
    aspect ratio, so the masonry grid never reflows as pictures load
  - Race-condition guard on search so a slow earlier query cannot overwrite
    the results of a newer one
  - Duplicate detection: the same image cannot be saved twice to one board
  - Toast notifications, empty states, and full keyboard/screen-reader support
    on dialogs and forms
  - Responsive layout from phone to desktop

-------------------------------------------------------------------------------
REFLECTION
-------------------------------------------------------------------------------

Running a separate frontend and backend was the biggest shift for me. Deciding
what belongs in the API versus the UI took longer than any feature, but putting
the Pixabay key on the server so it never reaches the browser was when that
separation stopped feeling like extra work.

The hardest bug had nothing to do with the API. No search images rendered at
all: I was hiding each image until it loaded, but an image hidden with
display:none is never treated as on-screen, so lazy loading never requested it
and the load event never fired. Every tile was waiting on itself.

-------------------------------------------------------------------------------
FEEDBACK ON THE CHALLENGE
-------------------------------------------------------------------------------

[REPLACE THIS with your own take - I can't write this part for you, since it
 depends on whether you went to the workshop on the 15th or office hours on
 the 16th, and what you thought of them. Even two honest sentences is enough.]

===============================================================================

# PFA — Real Estate Scraping Platform

**Stack** : NestJS + React + PostgreSQL + Prisma + Tailwind/shadcn/ui

---

## Architecture

```
apps/
  api/    → Backend NestJS
  web/    → Frontend React (Vite)
```

---

## Rôles

| Role | Description |
|---|---|
| **SUPER_ADMIN** | Full access : users, scraping, properties, logs |
| **RETAILER** | Gère ses annonces, dashboard analytics, répond aux clients |
| **CLIENT** | Parcourt, favoris, contacte les retailers, chatbot, estimation IA |
| **BUILDER** | Cherche terrains, liste constructions, outils d'estimation coût |

---

## Sprint 1 — Fondation (Auth + Structure)

### Backend (NestJS)
- [x] Initialisation du projet NestJS
- [x] Prisma setup + User model
- [ ] Auth module : register, login, JWT, refresh token
- [ ] Roles guard + decorator
- [ ] Swagger / OpenAPI
- [ ] User CRUD (super admin)

### Frontend (React)
- [x] Initialisation Vite + React + TS
- [x] Tailwind CSS + shadcn/ui
- [ ] React Router setup (layouts, routes)
- [ ] TanStack Query + axios client
- [ ] Zustand store (auth state)
- [ ] Pages : Login, Register
- [ ] ProtectedRoute + role-based redirects
- [ ] Layout avec sidebar/nav selon le rôle

---

## Sprint 2 — Properties CRUD

### Backend
- [ ] Property model (Prisma)
- [ ] Property CRUD avec filtres/tri/pagination
- [ ] Upload images (Multer → MinIO/S3)
- [ ] Recherche full-text (pgvector ou trigram)
- [ ] Favorites + Inquiries endpoints

### Frontend
- [ ] PropertyCard, PropertyList, PropertyDetail
- [ ] PropertyForm (retailer)
- [ ] Filtres avancés (prix, surface, type, localisation)
- [ ] Carte interactive (Leaflet/Mapbox)
- [ ] Favorites (ajout/retrait)
- [ ] Contacter le retailer

---

## Sprint 3 — Scraping Engine

### Backend
- [ ] ScrapingJob model + Bull queue (Redis)
- [ ] Puppeteer scrapers (sites JS : Tayara, Mubawab)
- [ ] Cheerio scrapers (sites statiques)
- [ ] Configuration par source (URL, selecteurs, pagination)
- [ ] Dashboard admin : lancer/manage jobs
- [ ] Normalisation des données scrapées → Property
- [ ] Déduplication (URL hash)
- [ ] Programmation automatique (cron daily)

### Frontend
- [ ] Scraping dashboard (admin)
- [ ] Voir les jobs (status, logs, résultats bruts)
- [ ] Configurer les sources

---

## Sprint 4 — Role-specific Dashboards

### Retailer
- [ ] Tableau de bord : mes annonces, stats (vues, contacts)
- [ ] Ajouter/modifier/supprimer des annonces
- [ ] Répondre aux clients (inbox)

### Builder
- [ ] Recherche terrains (filtres spéciaux)
- [ ] Mode carte
- [ ] Estimation coût construction

### Client
- [ ] Wishlist
- [ ] Alertes prix (email/in-app)
- [ ] Historique de recherche

### Super Admin
- [ ] Users CRUD
- [ ] Platform stats (users, annonces, scrapes)
- [ ] Logs système

---

## Sprint 5 — AI Features

### Chatbot
- [ ] RAG pipeline : embeddings properties → pgvector
- [ ] LangChain + GPT-4o-mini
- [ ] Sessions + historique
- [ ] Interface popup sur tout le site

### Price Estimation
- [ ] GPT few-shot sur properties similaires
- [ ] Affichage du prix estimé + intervalle confiance

### Market Trends
- [ ] Cron mensuel → analyse IA
- [ ] Graphiques d'evolution des prix

### Recommendations
- [ ] Basé sur historique navigation + favoris
- [ ] Affichage "vous pourriez aimer"

---

## Sprint 6 — Polish & Deploy

- [ ] Notifications email (nodemailer + Bull)
- [ ] Responsive design final
- [ ] Docker + docker-compose (api, web, postgres, redis, minio)
- [ ] Seed data
- [ ] README final + setup script

---

## AI Architecture (détail)

```
User Query → LangChain → Prompt template
                ↓
         Vector Store (pgvector)
         Embeddings des properties
                ↓
         RAG → GPT-4o-mini → Réponse
```

---

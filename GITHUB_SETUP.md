# Guide — Pousser sur GitHub & Créer un Codespace

## Étape 1 — Initialiser Git localement

Ouvrez un terminal (PowerShell ou Git Bash) dans le dossier du projet :

```powershell
cd "C:\Users\elkbabty\Desktop\riad"

# Initialiser le repo Git
git init

# Configurer votre identité (si pas déjà fait)
git config user.name  "Votre Nom"
git config user.email "vous@example.com"

# Premier commit
git add .
git commit -m "feat: complete Riad Lee reservation system (backend + frontend)"
```

---

## Étape 2 — Créer le repo sur GitHub

### Option A — GitHub CLI (recommandé)

```powershell
# Installer gh si nécessaire : https://cli.github.com
gh auth login

# Créer et pousser en une commande
gh repo create riad-lee --public --source=. --remote=origin --push
```

### Option B — Interface web

1. Aller sur https://github.com/new
2. Nom du repo : `riad-lee`
3. Visibilité : **Public** (requis pour Codespaces gratuit)
4. **Ne pas** cocher "Initialize with README"
5. Cliquer **Create repository**
6. Puis dans le terminal :

```powershell
git remote add origin https://github.com/VOTRE_USERNAME/riad-lee.git
git branch -M main
git push -u origin main
```

---

## Étape 3 — Créer un GitHub Codespace

1. Aller sur https://github.com/VOTRE_USERNAME/riad-lee
2. Cliquer le bouton vert **Code**
3. Onglet **Codespaces**
4. Cliquer **Create codespace on main**
5. Attendre ~3 minutes (installation automatique Java 21 + Node 20 + dépendances)

### Dans le Codespace, lancer l'application :

```bash
# Démarrer PostgreSQL + MailHog
docker compose -f docker-compose.full.yml --profile dev up postgres mailhog -d

# Terminal 1 — Backend
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Terminal 2 — Frontend
cd frontend
npm start -- --host 0.0.0.0 --disable-host-check
```

Les ports seront automatiquement redirigés :
- **4200** → Frontend Angular
- **8080** → API Spring Boot
- **8025** → MailHog web UI

---

## Étape 4 — Variables d'environnement (optionnel pour prod)

Pour déployer en production, ajoutez ces **Secrets** dans GitHub :
`Settings → Secrets and variables → Actions`

| Secret             | Valeur exemple                      |
|--------------------|-------------------------------------|
| `JWT_SECRET_KEY`   | Clé aléatoire de 64+ caractères     |
| `POSTGRES_PASSWORD`| Mot de passe fort pour PostgreSQL   |
| `MAIL_HOST`        | smtp.gmail.com (ou votre fournisseur)|
| `MAIL_USERNAME`    | votre.email@gmail.com               |
| `MAIL_PASSWORD`    | Mot de passe application Gmail      |

---

## Résumé des URLs

| Service           | URL locale              | URL Codespace          |
|-------------------|-------------------------|------------------------|
| Frontend Angular  | http://localhost:4200   | Port 4200 (forwarded)  |
| API Spring Boot   | http://localhost:8080   | Port 8080 (forwarded)  |
| Swagger UI        | localhost:8080/swagger-ui.html | idem             |
| MailHog           | http://localhost:8025   | Port 8025 (forwarded)  |

---

## Commandes utiles

```bash
# Voir les logs backend
docker compose -f docker-compose.full.yml logs -f backend

# Reconstruire et relancer
docker compose -f docker-compose.full.yml up --build -d

# Tests backend avec couverture
cd backend && mvn verify

# Build production frontend
cd frontend && npm run build:prod
```

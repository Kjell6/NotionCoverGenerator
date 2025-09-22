# Stage 1: Build-Umgebung
FROM node:20-alpine AS builder

# Arbeitsverzeichnis setzen
WORKDIR /app

# Abhängigkeiten zuerst kopieren (für besseres Caching)
COPY package.json ./

# Dependencies installieren
RUN npm install

# Quellcode kopieren
COPY . .

# Build ausführen
RUN npm run build

# ---

# Stage 2: Produktions-Umgebung
# Hier läuft die fertige, gebaute Anwendung
FROM node:20-alpine AS runner

WORKDIR /app

# Wichtig für Next.js Performance-Optimierungen
ENV NODE_ENV=production
# Deaktiviert die Telemetrie von Next.js
ENV NEXT_TELEMETRY_DISABLED=1

# Einen nicht-privilegierten Benutzer und eine Gruppe erstellen
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Notwendige Dateien aus der Build-Umgebung kopieren
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Port freigeben, auf dem die App läuft
EXPOSE 3000

# Benutzer auf einen nicht-privilegierten Benutzer ändern
USER nextjs

# Der Befehl, um die Anwendung zu starten
CMD ["node", "server.js"]


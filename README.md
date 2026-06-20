# La Casa nelle Rose

Sito web full stack per La Casa nelle Rose, negozio di arredamento provenzale, mobili francesi e oggetti d'antiquariato a Sesto Fiorentino.

## Stack

- Frontend: Angular
- Backend: PHP Slim REST API
- Database: MySQL
- Deploy: Docker + Kamal

## Avvio in sviluppo

```bash
docker compose up --build
```

Servizi:

- Frontend: http://localhost:4200
- API: http://localhost:8080/api
- MySQL: localhost:3306

## Account demo

- Username: `camille`
- Email: `camille@example.com`
- Password: `password123`

## Reset password

Il reset password usa token monouso con scadenza a 60 minuti. In produzione configura:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USERNAME`
- `SMTP_PASSWORD`
- `SMTP_SECURE`

In sviluppo, se SMTP non e configurato, l'API restituisce il link di reset nella risposta per facilitare il test locale.

## Deploy con Kamal

1. Aggiorna `config/deploy.yml` con host, registry e dominio reali.
2. Imposta i secret richiesti in `.kamal/secrets`.
3. Esegui:

```bash
kamal setup
kamal deploy
```

Il Dockerfile principale crea un'immagine unica con Angular compilato, Nginx, PHP-FPM e API Slim. MySQL e persistenza upload sono gestiti come accessory Kamal.

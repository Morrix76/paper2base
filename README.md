# Paper2Base

Tool B2B che estrae dati strutturati da documenti aziendali (fatture, buste paga, DDT, contratti) usando l'intelligenza artificiale, e li restituisce in formato JSON, Excel o CSV.

Carichi un documento — PDF, Word, Excel o immagine (incluso testo scritto a mano) — e Paper2Base ne legge il contenuto tramite un LLM multimodale, restituendo i campi in forma strutturata, pronti per Excel, gestionali o automazioni.

## Funzionalità

- **Multi-formato in ingresso**: PDF, Word (.docx), Excel (.xlsx), immagini (JPG/PNG). Le immagini vengono lette in modalità vision, quindi funziona anche con documenti fotografati o scritti a mano.
- **Estrazione AI** senza template: il modello identifica i campi rilevanti da solo.
- **Schema personalizzabile**: l'utente definisce quali campi estrarre senza toccare il codice.
- **Export**: JSON, Excel (multi-foglio) e CSV.
- **Webhook**: invio automatico dei dati estratti a servizi esterni (Zapier, Make, Google Sheets), gestito tramite coda asincrona.
- **Cronologia**: le estrazioni vengono salvate nel database e consultabili in una pagina dedicata.
- **Autenticazione**: registrazione con verifica email, login JWT, sistema a crediti (3 documenti gratuiti per nuovo utente).
- **Doppia lingua**: interfaccia in italiano e inglese.

## Stack tecnologico

**Backend**
- Python 3.11, FastAPI
- OpenAI API (gpt-4o) con Structured Outputs
- SQLAlchemy + PostgreSQL
- PyMuPDF, python-docx, openpyxl per la lettura dei file
- Arq per la coda webhook
- Resend per le email di verifica

**Frontend**
- React, TypeScript, Vite
- TailwindCSS, shadcn/ui
- i18next (IT/EN)

**Infrastruttura**
- Deploy su Railway (backend + frontend + PostgreSQL)

## Struttura del progetto

```
paper2base/
├── backend/     # API FastAPI, modelli DB, servizi AI ed email, worker webhook
├── frontend/    # App React (Vite)
└── start.bat    # Avvio locale di backend e frontend
```

## Avvio locale

Servono Python 3.11+, Node.js e una chiave OpenAI.

**Backend** (dalla cartella `backend`):
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
```

**Frontend** (dalla cartella `frontend`):
```bash
npm install
npm run dev
```

Le variabili d'ambiente (chiavi API, database, JWT, Resend) vanno configurate in `backend/.env` — mai committato, gestito localmente e su Railway.

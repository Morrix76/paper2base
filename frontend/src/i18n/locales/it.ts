export const it = {
  nav: {
    language: {
      it: 'IT',
      en: 'EN',
    },
  },
  hero: {
    title: 'Trasforma documenti in dati strutturati.',
    subtitle:
      'Carica un PDF, Word, Excel o immagine. Ottieni JSON, Excel o CSV in secondi.',
  },
  form: {
    openaiKey: {
      label: 'La tua API key OpenAI',
      placeholder: 'sk-...',
      help: 'La chiave viene usata solo per questa sessione, non viene salvata.',
    },
  },
  dropzone: {
    aria: 'Carica un documento: trascina qui o clicca per scegliere',
    dragOver: 'Rilascia il file',
    idle: 'Trascina un documento qui',
    orBrowse: 'oppure',
    browseFiles: 'sfoglia i file',
    formats: 'PDF, Word (.docx), Excel (.xlsx), immagini JPG o PNG',
    removeFile: 'Rimuovi file',
  },
  webhook: {
    label: 'URL Webhook (opzionale)',
    placeholder: 'https://hooks.zapier.com/... oppure https://...',
    help:
      'Inserisci un URL per ricevere i dati estratti in automatico (Zapier, Make, Google Sheets...)',
  },
  schema: {
    tabs: {
      default: 'Usa schema predefinito',
      custom: 'Schema personalizzato',
    },
    hint:
      'Definisci i campi da estrarre. Il modello cercherà solo questi valori nel documento.',
    field: {
      name: 'Nome campo',
      description: 'Descrizione (opzionale)',
      namePlaceholder: 'es. numero_fattura',
      descriptionPlaceholder: "Suggerimento per l'AI",
      type: 'Tipo',
      typeString: 'Testo',
      typeNumber: 'Numero',
      typeBoolean: 'Sì / No',
      removeAria: 'Rimuovi campo',
      add: 'Aggiungi campo',
    },
  },
  actions: {
    extract: 'Estrai dati',
    retry: 'Riprova',
    uploadAnother: 'Carica un altro PDF',
  },
  result: {
    file: 'File',
    defaultFilename: 'documento.pdf',
    tabs: {
      table: 'Tabella',
      json: 'JSON',
    },
    emptyLineItems: 'Nessuna riga di dettaglio.',
    emptyFields: 'Nessun campo estratto.',
    lineItemsTitle: 'Righe di dettaglio',
    fields: {
      documentType: 'Tipo documento',
      vendor: 'Fornitore',
      date: 'Data',
      number: 'Numero documento',
      total: 'Totale',
      taxes: 'Imposte',
    },
    table: {
      description: 'Descrizione',
      quantity: 'Quantità',
      unitPrice: 'Prezzo unitario',
    },
    values: {
      yes: 'Sì',
      no: 'No',
      dash: '—',
    },
  },
  export: {
    downloadJson: 'Scarica JSON',
    downloadExcel: 'Scarica Excel',
    downloadCsv: 'Scarica CSV',
    copied: 'Copiato!',
    copyToClipboard: 'Copia negli appunti',
    sheets: {
      extraction: 'Estrazione',
      summary: 'Riepilogo',
      rows: 'Righe',
    },
    headers: {
      field: 'Campo',
      value: 'Valore',
    },
  },
  errors: {
    customSchemaNeedsField:
      'Con schema personalizzato serve almeno un campo con il nome compilato.',
    timeout:
      'Timeout: la richiesta ha impiegato troppo tempo. Riprova con un PDF più piccolo.',
    cannotReachServer:
      'Impossibile contattare il server. Verifica che il backend sia in esecuzione su http://127.0.0.1:8001 e riprova.',
    serverHttp: 'Errore dal server (HTTP {{status}}).',
    unexpected: 'Si è verificato un errore imprevisto.',
  },
  footer: {
    copyright: 'Paper2Base © 2025',
  },
  download: {
    defaultBasename: 'estrazione',
  },
} as const


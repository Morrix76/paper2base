export const en = {
  nav: {
    language: {
      it: 'IT',
      en: 'EN',
    },
    documentsRemaining: 'documents remaining',
    creditsDepletedContact: 'Credits depleted — contact us',
  },
  hero: {
    title: 'Turn documents into structured data.',
    subtitle:
      'Upload a PDF, Word, Excel, or image. Get JSON, Excel, or CSV in seconds.',
  },
  form: {
    openaiKey: {
      label: 'Your OpenAI API key',
      placeholder: 'sk-...',
      help: 'The key is only used for this session and is not saved.',
    },
  },
  dropzone: {
    aria: 'Upload a document: drag here or click to choose',
    dragOver: 'Drop the file',
    idle: 'Drag a document here',
    orBrowse: 'or',
    browseFiles: 'browse files',
    formats: 'PDF, Word (.docx), Excel (.xlsx), JPG or PNG images',
    removeFile: 'Remove file',
  },
  webhook: {
    label: 'Webhook URL (optional)',
    placeholder: 'https://hooks.zapier.com/... or https://...',
    help:
      'Enter a URL to receive extracted data automatically (Zapier, Make, Google Sheets...)',
  },
  schema: {
    tabs: {
      default: 'Use default schema',
      custom: 'Custom schema',
    },
    hint:
      'Define the fields to extract. The model will only look for these values in the document.',
    field: {
      name: 'Field name',
      description: 'Description (optional)',
      namePlaceholder: 'e.g. invoice_number',
      descriptionPlaceholder: 'Hint for the AI',
      type: 'Type',
      typeString: 'Text',
      typeNumber: 'Number',
      typeBoolean: 'Yes / No',
      removeAria: 'Remove field',
      add: 'Add field',
    },
  },
  actions: {
    extract: 'Extract data',
    retry: 'Try again',
    uploadAnother: 'Upload another PDF',
  },
  result: {
    file: 'File',
    defaultFilename: 'document.pdf',
    tabs: {
      table: 'Table',
      json: 'JSON',
    },
    emptyLineItems: 'No line items.',
    emptyFields: 'No extracted fields.',
    lineItemsTitle: 'Line items',
    fields: {
      documentType: 'Document type',
      vendor: 'Vendor',
      date: 'Date',
      number: 'Document number',
      total: 'Total',
      taxes: 'Taxes',
    },
    table: {
      description: 'Description',
      quantity: 'Quantity',
      unitPrice: 'Unit price',
    },
    values: {
      yes: 'Yes',
      no: 'No',
      dash: '—',
    },
  },
  export: {
    downloadJson: 'Download JSON',
    downloadExcel: 'Download Excel',
    downloadCsv: 'Download CSV',
    copied: 'Copied!',
    copyToClipboard: 'Copy to clipboard',
    sheets: {
      extraction: 'Extraction',
      summary: 'Summary',
      rows: 'Rows',
    },
    headers: {
      field: 'Field',
      value: 'Value',
    },
  },
  errors: {
    customSchemaNeedsField:
      'With a custom schema you need at least one field with a name filled in.',
    timeout:
      'Timeout: the request took too long. Try again with a smaller PDF.',
    cannotReachServer:
      'Unable to reach the server. Make sure the backend is running on http://127.0.0.1:8001 and try again.',
    serverHttp: 'Server error (HTTP {{status}}).',
    unexpected: 'An unexpected error occurred.',
  },
  footer: {
    copyright: 'Paper2Base © 2026',
  },
  auth: {
    register: {
      freeBanner: 'Start free with 3 documents — no credit card required',
    },
  },
  landing: {
    hero: {
      badge: '✨ 3 free documents — no credit card',
      title: 'Turn documents into structured data.',
      subtitle:
        'Upload PDF, Word, Excel, or images — get JSON, Excel, or CSV ready to use',
      cta: 'Start free',
    },
    howItWorks: {
      kicker: 'How it works',
      title: 'How it works',
      step1: 'Upload the document',
      step2: 'AI extracts the data',
      step3: 'Download or integrate',
    },
    formats: {
      kicker: 'Supported formats',
      title: 'Supported formats',
      pdf: 'PDF',
      word: 'Word',
      excel: 'Excel',
      images: 'JPG/PNG',
      handwritten: 'Handwritten',
    },
    pricing: {
      kicker: 'Pricing',
      title: 'Pricing',
      body: 'Want more documents or a business plan? Email us at',
    },
  },
  download: {
    defaultBasename: 'extraction',
  },
} as const


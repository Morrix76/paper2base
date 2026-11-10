# Paper2Base

### AI-Powered Business Document Processing & Structured Data Extraction

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![OpenAI](https://img.shields.io/badge/AI-OpenAI-412991?logo=openai)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Status](https://img.shields.io/badge/Status-In%20Development-orange)

> Turn business documents into structured, actionable data using multimodal artificial intelligence. Extract information from PDFs, invoices, contracts, spreadsheets, and images — and export it to JSON, Excel, or CSV.

---

## 🎯 Overview

**Paper2Base** is an AI-powered B2B application designed to automate structured information extraction from business and administrative documents.

Companies regularly process invoices, delivery notes, contracts, payroll documents, and other files containing valuable information.

Manually transferring this information into spreadsheets, databases, or business management systems is time-consuming and prone to errors.

Paper2Base explores how multimodal Large Language Models (LLMs) can simplify this process.

### The Goal

**Upload a document → Extract relevant information → Generate structured data → Export or integrate**

The application combines document processing, AI-based extraction, customizable schemas, and data export capabilities within a web interface.

---

## ✨ Features

### 📄 Multi-Format Document Processing

Supported document formats:

| Format | Processing Method |
|---|---|
| PDF | Text extraction or image-based AI analysis |
| Word (.docx) | Document text extraction |
| Excel (.xlsx) | Spreadsheet data extraction |
| JPG / JPEG | Multimodal AI vision |
| PNG | Multimodal AI vision |

PDF documents with limited extractable text are converted into images for vision-based analysis.

This approach also enables processing of scanned documents and images containing handwritten text, although extraction accuracy depends on document quality.

### 🤖 AI-Powered Data Extraction

- Multimodal document analysis using OpenAI models.
- Structured information extraction.
- Identification of document fields and business information.
- Extraction of invoice and administrative data.
- JSON output based on predefined schemas.
- Handling of missing values without requiring invented information.

The default AI model is configurable, with GPT-4o used in the current configuration.

### 🧩 Custom Extraction Schemas

Paper2Base allows users to define which information should be extracted.

Instead of relying exclusively on predefined document templates, users can specify custom fields.

Supported custom field types include:

- String
- Number
- Boolean

Each field can include a name and an optional description.

This makes the application adaptable to different business document structures.

### 📊 Structured Data Export

Extracted information can be exported in multiple formats:

- **JSON** — For applications, APIs, and automation pipelines.
- **Excel** — For spreadsheet-based workflows.
- **CSV** — For tabular data processing and external systems.

The application includes an interface for reviewing extraction results before export.

### 🔗 Webhook Integration

Paper2Base includes an asynchronous webhook mechanism designed to forward extraction results to external services.

The architecture uses Redis and ARQ for background job processing.

Potential integration destinations include:

- Zapier
- Make
- Custom REST APIs
- Business automation workflows

Webhook delivery requires the queue infrastructure and worker to be configured and running.

### 🗂️ Extraction History

- Store extraction results in the database.
- Associate records with authenticated users.
- Retrieve previous extraction records.
- Review extraction history through the application interface.

### 🔐 User Authentication

- User registration and login.
- Email verification.
- JWT-based authentication.
- Protected extraction endpoints.
- Credit-based document processing.

Newly registered users receive **3 initial extraction credits** in the current implementation.

### 🌍 Multilingual Interface

- Italian
- English

The frontend uses i18next for internationalization.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Backend Language | Python 3.11+ |
| API Framework | FastAPI |
| AI Provider | OpenAI API |
| AI Processing | Multimodal LLMs, Structured Outputs |
| Database | PostgreSQL / SQLAlchemy |
| Local Database Option | SQLite |
| Frontend | React 19 |
| Programming Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui, Radix UI |
| Authentication | JWT |
| Background Jobs | Redis, ARQ |
| Email Service | Resend |
| Document Processing | PyMuPDF, python-docx, openpyxl |
| Internationalization | i18next |
| Deployment Infrastructure | Railway |

---

## 🏗️ System Architecture

Paper2Base separates the user interface, API services, AI processing, and data persistence.

### Document Processing Pipeline

**1. Document Upload**

Users upload a supported business document through the React interface.

**2. File Validation**

The backend checks the uploaded content and identifies the document format.

**3. Content Preparation**

Depending on the format, the application extracts text or prepares document images for multimodal analysis.

**4. AI Extraction**

The OpenAI integration processes the document using either a default extraction schema or a user-defined schema.

**5. Structured Output**

The extracted fields are returned as structured JSON.

**6. Database Storage**

Extraction records are saved and associated with the authenticated user.

**7. Export or Integration**

Results can be exported or forwarded through configured webhook workflows.

---

## 🗄️ Data Management

Paper2Base uses SQLAlchemy for database operations.

The application defines three primary data entities:

| Entity | Purpose |
|---|---|
| Users | Account information, authentication, and credits |
| Verification Tokens | Email verification |
| Extractions | Extracted document data and processing history |

PostgreSQL is used for the deployed architecture, while SQLite is available as a local development fallback.

---

## 🚀 Quick Start

### Prerequisites

Before running Paper2Base, install:

- Python 3.11 or later
- Node.js and npm
- Git
- An OpenAI API key

PostgreSQL is recommended for the deployed setup. Local development can use SQLite.

### 1. Clone the Repository

```bash
git clone https://github.com/Morrix76/paper2base.git
cd paper2base
```

### 2. Configure the Backend

Navigate to the backend directory:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```bash
.venv\Scripts\activate
```

Install the required dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file inside the `backend` directory.

Example:

```env
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o

DATABASE_URL=sqlite:///./paper2base.db
JWT_SECRET=your_secure_jwt_secret

RESEND_API_KEY=your_resend_api_key
RESEND_FROM=your_verified_sender_address

APP_URL=http://localhost:5173
```

Use your own credentials and configure the email service before testing account verification.

For PostgreSQL deployment, replace the SQLite database URL with your PostgreSQL connection string.

**Security:** Never commit `.env` files, API keys, authentication secrets, or database credentials.

### 4. Start the Backend

From the `backend` directory:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
```

The API will be available at:

`http://127.0.0.1:8001`

Interactive FastAPI documentation:

`http://127.0.0.1:8001/docs`

### 5. Configure the Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env.local` file in the frontend directory:

```env
VITE_API_URL=http://127.0.0.1:8001
```

### 6. Start the Frontend

```bash
npm run dev
```

Open:

`http://localhost:5173`

The interface can now communicate with the local FastAPI backend.

**Note:** Asynchronous webhook delivery requires an additional Redis and ARQ worker setup.

---

## 🔌 API Overview

The backend exposes REST endpoints for document extraction and account management.

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/v1/extract` | POST | Document extraction |
| `/api/v1/history` | GET | Extraction history |
| `/api/v1/auth/register` | POST | Account registration |
| `/api/v1/auth/login` | POST | Authentication |
| `/api/v1/auth/me` | GET | Current user information |
| `/health` | GET | API health check |
| `/docs` | GET | Interactive API documentation |

Extraction endpoints require authentication.

---

## 🧪 Development Methodology

Paper2Base was developed through an AI-assisted software development workflow.

My responsibilities include:

1. **Problem Analysis** — Identifying business needs and repetitive document processing tasks.
2. **Product Definition** — Establishing requirements, expected behavior, and functional priorities.
3. **Architecture Evaluation** — Reviewing technical approaches and system design with AI assistance.
4. **AI-Assisted Implementation** — Coordinating development with Claude, Cursor, and ChatGPT.
5. **Testing & Debugging** — Investigating errors, checking system behavior, and validating results.
6. **Continuous Improvement** — Refining the application based on tests and identified limitations.

The approach combines AI-supported implementation with human-led decision-making and technical verification.

---

## 🔭 Roadmap

Potential future development priorities:

- [ ] Expand supported business document formats.
- [ ] Improve extraction reliability on complex layouts.
- [ ] Introduce systematic extraction accuracy benchmarks.
- [ ] Expand integrations with ERP platforms.
- [ ] Improve webhook monitoring and error reporting.
- [ ] Strengthen automated testing.
- [ ] Introduce advanced document validation workflows.
- [ ] Improve scalability for larger document volumes.

These items represent planned improvements, not completed functionality.

---

## ⚠️ Project Status & Limitations

**Paper2Base is under ongoing development.**

The repository includes implemented components for document processing, AI extraction, authentication, data storage, and integration workflows.

However:

- AI-generated extraction results may contain errors.
- Handwritten or low-quality documents may reduce extraction accuracy.
- External AI processing requires an OpenAI API connection.
- Webhook delivery depends on the availability of the background queue infrastructure.
- Production reliability, security, and scalability require further validation.

The application should be tested thoroughly before use with sensitive business documents or critical operational workflows.

---

## 👨‍💻 Author

**Francesco Ciardo**

AI Builder | AI-Assisted Software Development | AI Engineering

- **GitHub:** [Morrix76](https://github.com/Morrix76)
- **LinkedIn:** [Professional Profile](https://linkedin.com/in/dias-ai)
- **Website:** [DIAS AI](https://diasai.xyz/)

---

*Transforming business documents into structured data through AI-assisted software development, technical validation, and continuous improvement.*

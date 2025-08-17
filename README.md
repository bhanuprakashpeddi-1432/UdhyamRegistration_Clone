# Udyam Registration Form Clone

A comprehensive full-stack clone of the Udyam Registration portal's first two steps, built with modern web technologies.

## 🚀 Features

- **Web Scraping**: Python-based scraper to extract form fields and validation rules
- **Responsive Frontend**: React/Next.js with TypeScript, mobile-first design
- **RESTful Backend**: Node.js/Express with PostgreSQL and Prisma ORM
- **Comprehensive Testing**: Unit and integration tests with Jest and pytest
- **Docker Support**: Containerized deployment setup
- **Real-time Validation**: Client and server-side validation with proper error handling

## 📁 Project Structure

```
├── web-scraper/          # Python web scraping module
│   ├── scraper.py        # Main scraping logic
│   ├── schema_generator.py # JSON schema generation
│   └── requirements.txt  # Python dependencies
├── frontend/             # React/Next.js frontend
│   ├── src/              # Source code
│   ├── public/           # Static assets
│   └── package.json      # Frontend dependencies
├── backend/              # Node.js Express backend
│   ├── src/              # Source code
│   ├── prisma/           # Database schema
│   └── package.json      # Backend dependencies
├── tests/                # Test suites
├── docker/               # Docker configuration
└── docs/                 # Documentation
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui components
- **Validation**: Zod + React Hook Form
- **Testing**: Jest + React Testing Library

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod
- **Testing**: Jest + Supertest

### Web Scraper
- **Language**: Python 3.9+
- **Libraries**: BeautifulSoup4, Requests, Selenium
- **Testing**: pytest

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- PostgreSQL 14+
- Docker (optional)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd udyam-registration-clone
```

### 2. Web Scraping
```bash
cd web-scraper
pip install -r requirements.txt
python scraper.py
```

### 3. Backend Setup
```bash
cd backend
npm install
npm run db:setup
npm run dev
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 5. Run Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests  
cd frontend && npm test

# Scraper tests
cd web-scraper && pytest
```

## 🐳 Docker Deployment

```bash
# Build and run all services
docker-compose up --build

# Run specific service
docker-compose up frontend
docker-compose up backend
```

## 📊 API Documentation

### Endpoints

#### POST /api/submit
Submit form data for validation and storage.

**Request Body:**
```json
{
  "step": 1,
  "data": {
    "aadharNumber": "123456789012",
    "panNumber": "ABCDE1234F",
    "enterpriseName": "Sample Enterprise"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Data submitted successfully",
  "submissionId": "uuid-here"
}
```

## 🧪 Testing Strategy

### Frontend Tests
- Component unit tests
- Form validation tests
- User interaction tests
- Responsive design tests

### Backend Tests
- API endpoint tests
- Validation logic tests
- Database integration tests
- Error handling tests

### Scraper Tests
- Schema extraction accuracy
- Field validation rules
- Error handling for dynamic content

## 🔧 Development Guidelines

### Code Quality
- ESLint + Prettier for code formatting
- Husky for pre-commit hooks
- TypeScript strict mode
- 80%+ test coverage target

### Git Workflow
- Feature branch workflow
- Conventional commits
- PR reviews required
- Automated CI/CD

## 📈 Performance Optimizations

- **Frontend**: Code splitting, lazy loading, optimized images
- **Backend**: Database indexing, query optimization, caching
- **Deployment**: CDN integration, compression, monitoring

## 🔒 Security Features

- Input sanitization and validation
- SQL injection prevention
- XSS protection
- Rate limiting
- CORS configuration

## 🚀 Deployment

### Production Deployment
- **Frontend**: Vercel/Netlify
- **Backend**: Railway/Heroku
- **Database**: PostgreSQL on cloud provider
- **Monitoring**: Application and database monitoring

## 📝 Documentation

- [Web Scraper Documentation](./web-scraper/README.md)
- [Frontend Documentation](./frontend/README.md)
- [Backend Documentation](./backend/README.md)
- [API Documentation](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For questions and support, please open an issue or contact the development team.

---

**Note**: This is a learning project and clone for educational purposes. Please ensure compliance with the original website's terms of service.

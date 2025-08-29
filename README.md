# AI Gateway

[![Version](https://img.shields.io/badge/version-0.3.0-blue.svg)](VERSION)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://python.org)
[![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-blue.svg)](https://nextjs.org)

A professional, enterprise-grade AI Gateway platform that provides secure, scalable, and customizable access to multiple AI services including OpenAI, Anthropic, and custom fine-tuned models. Built with modern technologies and designed for enterprise environments with comprehensive white-labeling capabilities.

## 🚀 Features

- **Multi-Provider AI Integration**: Support for OpenAI, Anthropic, and custom models
- **Enterprise Security**: Microsoft Active Directory integration, role-based access control
- **White-Labeling**: Fully customizable branding, colors, and company identity with persistent storage
- **Fine-tuning & Training**: Built-in tools for training and customizing AI models
- **Analytics & Monitoring**: Comprehensive usage analytics and performance metrics
- **Responsive Design**: Modern, mobile-first UI built with Next.js and Tailwind CSS
- **API Gateway**: RESTful API with comprehensive documentation
- **Docker Support**: Containerized deployment for easy scaling
- **E2E Testing**: Full Playwright test coverage for all UI components

## 🏗️ Architecture

- **Backend**: FastAPI (Python) with SQLAlchemy ORM and async support
- **Frontend**: Next.js 14 with React 18 and TypeScript
- **Database**: PostgreSQL with async support
- **Authentication**: Microsoft OIDC integration
- **Styling**: Tailwind CSS with shadcn/ui components
- **Design System**: Comprehensive design tokens and component library
- **Testing**: Playwright E2E tests with comprehensive coverage

## 📋 Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 16+
- Docker & Docker Compose (optional)
- Microsoft Azure AD (for authentication)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/wsclx/ai-gateway.git
cd ai-gateway
```

### 2. Environment Setup

```bash
# Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit configuration files with your settings
# See Configuration section below
```

### 3. Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Set up database
alembic upgrade head

# Create demo data (optional)
python create_demo_data.py

# Start backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Frontend Setup

```bash
cd frontend
npm install

# Development mode
npm run dev

# Production build
npm run build
npm start
```

### 5. Access the Application

- Frontend: http://localhost:3000 (dev) or http://localhost:3001 (prod)
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### 6. Run Tests

```bash
# Frontend E2E tests
cd frontend
npx playwright test

# Backend tests
cd backend
pytest
```

## 🐳 Docker Deployment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## ⚙️ Configuration

### Environment Variables

#### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost/ai_gateway

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Microsoft Azure AD
AZURE_CLIENT_ID=your_client_id
AZURE_CLIENT_SECRET=your_client_secret
AZURE_TENANT_ID=your_tenant_id

# Security
SECRET_KEY=your_secret_key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=AI Gateway
```

## 🎨 Customization

### White-Labeling

The application includes a comprehensive white-labeling system accessible via the Branding section:

- Company information and branding
- Custom colors and typography
- Logo and visual identity
- Feature toggles and customization
- Localization settings

### Design System

All UI components follow a consistent design system defined in `/design/`:

- Design tokens for colors, spacing, typography
- Component guidelines and standards
- Accessibility requirements
- Performance budgets

## 📚 API Documentation

The API is fully documented with OpenAPI/Swagger:

- Interactive API docs: `/docs`
- OpenAPI schema: `/openapi.json`
- ReDoc alternative: `/redoc`

### Key Endpoints

- **Authentication**: `/api/v1/auth/ms/*`
- **Chat**: `/api/v1/chat/*`
- **Assistants**: `/api/v1/assistants/*`
- **Analytics**: `/api/v1/analytics/*`
- **Admin**: `/api/v1/admin/*`
- **Settings**: `/api/v1/settings/*`
- **Training**: `/api/v1/training/*`

## 🔒 Security Features

- Microsoft Active Directory integration
- Role-based access control (RBAC)
- JWT token authentication
- API rate limiting
- Input validation and sanitization
- CORS configuration
- Secure headers

## 📊 Monitoring & Analytics

- Real-time usage analytics
- Performance metrics
- Cost tracking
- User activity monitoring
- Error logging and alerting

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm run test

# E2E tests
npm run test:e2e
```

## 📦 Development

### Project Structure

```
ai-gateway/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── core/           # Core functionality
│   │   ├── models/         # Database models
│   │   └── schemas/        # Pydantic schemas
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                # Next.js frontend
│   ├── app/                # App Router pages
│   ├── components/         # React components
│   ├── lib/                # Utilities and hooks
│   └── design/             # Design system
├── design/                  # Design documentation
├── docs/                    # Technical documentation
├── docker-compose.yml
└── README.md
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

- **Documentation**: [Technical Documentation](docs/)
- **Issues**: [GitHub Issues](https://github.com/wsclx/ai-gateway/issues)
- **Discussions**: [GitHub Discussions](https://github.com/wsclx/ai-gateway/discussions)

## 🔄 Version History

- **0.3.0** - Code cleanup, security fixes, and optimization
- **0.2.0** - Core AI Gateway functionality
- **0.1.0** - Basic chat and assistant management

---

**Built with ❤️ for enterprise AI solutions**

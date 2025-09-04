# Contributing to AI Gateway

Thank you for your interest in contributing to AI Gateway! This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Git
- Node.js 18+ (for frontend development)
- Python 3.11+ (for backend development)

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/ai-gateway
   cd ai-gateway
   ```

2. **Start Development Environment**
   ```bash
   docker compose up -d
   ```

3. **Verify Installation**
   ```bash
   docker compose ps
   curl http://localhost:5555/health
   ```

## Development Guidelines

### Code Style

#### Backend (Python)
- Follow PEP 8 style guide
- Use type hints for all functions
- Maximum line length: 88 characters
- Use Black for code formatting
- Use isort for import sorting

#### Frontend (TypeScript/React)
- Use TypeScript strict mode
- Follow ESLint configuration
- Use Prettier for formatting
- Use functional components with hooks
- Follow React best practices

### Testing

#### Backend Tests
```bash
cd backend
python -m pytest
python -m pytest --cov=app
```

#### Frontend Tests
```bash
cd frontend
npm run test
npx playwright test
```

#### All Tests
```bash
# Run all critical tests
cd frontend
npx playwright test tests/critical-functions.spec.ts
```

### Git Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write code following style guidelines
   - Add tests for new functionality
   - Update documentation if needed

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

4. **Push and Create Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Format

Use conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build/tooling changes

Examples:
```
feat(api): add user management endpoints
fix(frontend): resolve navigation issues
docs(readme): update installation instructions
```

## Project Structure

```
ai-gateway/
├── backend/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── core/          # Core configuration
│   │   ├── models/        # Database models
│   │   └── services/      # Business logic
│   ├── migrations/        # Database migrations
│   ├── tests/            # Backend tests
│   └── requirements.txt   # Python dependencies
├── frontend/
│   ├── app/              # Next.js app directory
│   ├── components/        # React components
│   ├── lib/              # Utility functions
│   ├── tests/            # Frontend tests
│   └── package.json      # Node.js dependencies
├── docker-compose.yml    # Docker configuration
└── README.md            # Project documentation
```

## API Development

### Adding New Endpoints

1. **Create Route File**
   ```python
   # backend/app/api/v1/your_feature.py
   from fastapi import APIRouter, Depends
   from app.models.your_model import YourModel
   from app.services.your_service import YourService
   
   router = APIRouter()
   
   @router.get("/your-endpoint")
   async def get_your_data():
       return {"message": "Your data"}
   ```

2. **Register Route**
   ```python
   # backend/app/api/v1/__init__.py
   from .your_feature import router as your_router
   
   api_router.include_router(your_router, prefix="/your-feature")
   ```

3. **Add Tests**
   ```python
   # backend/tests/test_your_feature.py
   def test_get_your_data(client):
       response = client.get("/api/v1/your-feature/your-endpoint")
       assert response.status_code == 200
   ```

## Frontend Development

### Adding New Components

1. **Create Component**
   ```typescript
   // frontend/components/YourComponent.tsx
   import React from 'react';
   
   interface YourComponentProps {
     title: string;
   }
   
   export function YourComponent({ title }: YourComponentProps) {
     return <div>{title}</div>;
   }
   ```

2. **Add Tests**
   ```typescript
   // frontend/tests/your-component.spec.ts
   import { test, expect } from '@playwright/test';
   
   test('YourComponent displays title', async ({ page }) => {
     await page.goto('/your-page');
     await expect(page.getByText('Your Title')).toBeVisible();
   });
   ```

## Database Changes

### Creating Migrations

1. **Create Migration**
   ```bash
   cd backend
   alembic revision --autogenerate -m "Add your table"
   ```

2. **Apply Migration**
   ```bash
   alembic upgrade head
   ```

3. **Update Models**
   ```python
   # backend/app/models/your_model.py
   from sqlalchemy import Column, String, DateTime
   from app.core.database import Base
   
   class YourModel(Base):
       __tablename__ = "your_table"
       
       id = Column(String, primary_key=True)
       name = Column(String, nullable=False)
   ```

## Documentation

### Updating Documentation

1. **README.md**: Update for major changes
2. **API Docs**: Automatically generated from code
3. **CHANGELOG.md**: Document all changes
4. **Inline Comments**: Add for complex logic

### Documentation Standards

- Use clear, concise language
- Include code examples
- Update API documentation
- Keep installation instructions current

## Review Process

### Pull Request Guidelines

1. **Description**: Clear description of changes
2. **Tests**: All tests must pass
3. **Documentation**: Update relevant docs
4. **Code Review**: Address reviewer feedback

### Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No breaking changes (or documented)
- [ ] Security implications considered

## Reporting Issues

### Bug Reports

Include:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Error logs if applicable

### Feature Requests

Include:
- Clear description of the feature
- Use case and benefits
- Implementation suggestions if possible

## Getting Help

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Documentation**: README.md and inline docs
- **API Docs**: http://localhost:5555/docs

## Code of Conduct

- Be respectful and inclusive
- Focus on technical discussions
- Help others learn and grow
- Follow project guidelines

Thank you for contributing to AI Gateway!

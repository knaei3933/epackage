# Contributing Guide

Thank you for your interest in contributing to Epackage Lab Web! This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Testing Requirements](#testing-requirements)
- [Git Workflow](#git-workflow)
- [Commit Message Format](#commit-message-format)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Documentation](#documentation)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

### Our Pledge

We are committed to making participation in this project a harassment-free experience for everyone, regardless of level of experience, gender, gender identity and expression, sexual orientation, disability, personal appearance, body size, race, ethnicity, age, religion, or nationality.

### Our Standards

**Positive behavior includes:**
- Being respectful and inclusive
- Welcoming new contributors
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Harassment or discriminatory language
- Personal attacks or insults
- Public or private harassment
- Publishing others' private information
- Unprofessional conduct

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js 18.17+** and npm installed
- **Git** for version control
- **GitHub account** for pull requests and issues
- **Text Editor**: VS Code, WebStorm, or similar

### First-Time Setup

```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/your-username/epackage-lab-web.git
cd epackage-lab-web

# 3. Install dependencies
npm install

# 4. Copy environment variables
cp .env.local.example .env.local

# 5. Start development server
npm run dev

# 6. Run tests
npm run test
```

## Development Setup

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "dsznajder.es7-react-js-snippets",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

### Configure VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

### Configure Git Hooks

Install Husky for pre-commit hooks:

```bash
# Install Husky
npm install -D husky

# Initialize Husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm run test"
```

## Code Style

### TypeScript Guidelines

**Use TypeScript for all new code:**

```typescript
// Good: Explicit types
interface User {
  id: string;
  email: string;
  role: 'customer' | 'admin';
}

function getUser(id: string): Promise<User> {
  // ...
}

// Bad: Implicit any
function getUser(id) {
  // ...
}
```

**Follow best practices:**

- Use interfaces for object shapes
- Use type aliases for unions and primitives
- Avoid `any` type
- Use `readonly` for immutable data
- Prefer `const` over `let`

### React Best Practices

**Component structure:**

```typescript
// Good: Proper component organization
import { useState, useEffect } from 'react';

interface ComponentProps {
  title: string;
  onSubmit: (data: FormData) => void;
}

export function MyComponent({ title, onSubmit }: ComponentProps) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Side effects
  }, []);

  const handleSubmit = (data: FormData) => {
    setIsLoading(true);
    onSubmit(data);
  };

  return (
    <div>
      <h1>{title}</h1>
      {/* JSX */}
    </div>
  );
}
```

**Follow rules:**

- Use functional components with hooks
- Avoid class components
- Use proper TypeScript types for props
- Extract reusable logic into custom hooks
- Keep components focused and small

### Naming Conventions

**Files and Directories:**

```
components/           # PascalCase for component folders
  UserProfile/       # Component folder
    index.tsx        # Main component file
    test.tsx         # Test file
    types.ts         # Type definitions
```

**Variables and Functions:**

```typescript
// camelCase for variables and functions
const userCount = 10;
function getUserData() { }

// PascalCase for components and types
function UserProfile() { }
interface UserProfileProps { }

// UPPER_CASE for constants
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'https://api.example.com';
```

### Code Organization

**File structure:**

```typescript
// 1. Imports
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// 2. Type definitions
interface ComponentProps { }

// 3. Constants
const DEFAULT_VALUE = 'default';

// 4. Component function
export function MyComponent({ }: ComponentProps) {
  // 5. Hooks
  const [value, setValue] = useState(DEFAULT_VALUE);

  // 6. Event handlers
  const handleClick = () => { };

  // 7. Effects
  useEffect(() => { }, []);

  // 8. Derived values
  const isEnabled = value !== '';

  // 9. Render helpers
  const renderItem = (item: string) => <div>{item}</div>;

  // 10. Return JSX
  return <div>{/* JSX */}</div>;
}
```

### Comments and Documentation

**JSDoc for functions:**

```typescript
/**
 * Fetches user data from the API
 * @param id - The user ID
 * @returns Promise<User> - The user object
 * @throws {Error} When user is not found
 */
async function getUser(id: string): Promise<User> {
  // ...
}
```

**Inline comments:**

```typescript
// Good: Explains WHY, not WHAT
// Use debounce to prevent excessive API calls during typing
const debouncedSearch = debounce(handleSearch, 300);

// Bad: Repeats the code
// Set loading to true
setIsLoading(true);
```

## Testing Requirements

### Unit Tests

Write unit tests for:
- Utility functions
- Custom hooks
- Complex logic
- Data transformations

```typescript
// Example unit test
import { describe, it, expect } from '@jest/globals';
import { calculatePrice } from '@/lib/pricing';

describe('calculatePrice', () => {
  it('should calculate base price correctly', () => {
    const result = calculatePrice({
      quantity: 100,
      unitPrice: 10
    });
    expect(result).toBe(1000);
  });

  it('should apply discount for bulk orders', () => {
    const result = calculatePrice({
      quantity: 1000,
      unitPrice: 10,
      discountPercent: 10
    });
    expect(result).toBe(9000);
  });
});
```

### Integration Tests

Test component interactions:

```typescript
// Example integration test
import { render, screen, fireEvent } from '@testing-library/react';
import { QuoteForm } from '@/components/quote/QuoteForm';

describe('QuoteForm', () => {
  it('should submit form with valid data', async () => {
    const onSubmit = jest.fn();
    render(<QuoteForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('Quantity'), {
      target: { value: '100' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmit).toHaveBeenCalledWith({
      quantity: 100
    });
  });
});
```

### E2E Tests

Write E2E tests for critical user flows:

```typescript
// Example E2E test
import { test, expect } from '@playwright/test';

test('customer can place an order', async ({ page }) => {
  // Navigate to homepage
  await page.goto('/');

  // Sign in
  await page.click('text=Sign In');
  await page.fill('[name="email"]', 'customer@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Navigate to catalog
  await page.click('text=Catalog');

  // Add product to cart
  await page.click('text=Add to Quote');

  // Verify product in cart
  await expect(page.locator('text=Quote (1)')).toBeVisible();
});
```

### Test Coverage Requirements

- **Unit tests**: 80%+ coverage
- **Integration tests**: Critical paths covered
- **E2E tests**: All major user flows

Run coverage report:

```bash
npm run test:coverage
```

## Git Workflow

### Branch Strategy

```
main                    # Production-ready code
  ├── develop          # Integration branch for features
      ├── feature/*    # New features
      ├── fix/*        # Bug fixes
      ├── refactor/*   # Code refactoring
      └── docs/*       # Documentation updates
```

### Creating a Feature Branch

```bash
# 1. Ensure your main branch is up to date
git checkout main
git pull origin main

# 2. Create feature branch from main
git checkout -b feature/your-feature-name

# 3. Make your changes
git add .
git commit -m "feat: add your feature"

# 4. Push to your fork
git push origin feature/your-feature-name
```

### Branch Naming

Use these prefixes:

- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation changes
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks
- `perf/` - Performance improvements

Examples:
```
feature/user-authentication
fix/login-validation-error
refactor/pricing-engine
docs/api-documentation
test/order-creation-flow
```

### Syncing with Upstream

```bash
# Add upstream repository
git remote add upstream https://github.com/original-owner/epackage-lab-web.git

# Fetch upstream changes
git fetch upstream

# Merge upstream main into your branch
git merge upstream/main

# Push to your fork
git push origin feature/your-feature-name
```

## Commit Message Format

Follow Conventional Commits specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### Examples

```
# Simple commit
feat(auth): add user registration

# Commit with body
fix(api): handle rate limiting errors

- Implement exponential backoff
- Add retry logic for failed requests
- Update error messages for users

Closes #123

# Breaking change
feat(api)!: remove deprecated endpoints

BREAKING CHANGE: The `/api/v1/users` endpoint has been removed.
Use `/api/v2/users` instead.
```

### Commit Message Guidelines

- Use present tense ("add" not "added")
- Use imperative mood ("move" not "moves")
- Limit first line to 72 characters
- Wrap body at 72 characters
- Explain WHAT and WHY, not HOW

## Pull Request Guidelines

### Before Creating a PR

1. **Update documentation**
   - Update README if needed
   - Update API docs for API changes
   - Update component docs

2. **Add tests**
   - Unit tests for new functions
   - Integration tests for components
   - E2E tests for user flows

3. **Run all tests**
   ```bash
   npm run test
   npm run lint
   npm run build
   ```

4. **Update CHANGELOG**
   - Add entry to CHANGELOG.md
   - Describe changes clearly

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] All tests passing

## Checklist
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No new warnings
- [ ] CHANGELOG updated
- [ ] Commits follow convention

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Fixes #123
Related to #456
```

### PR Review Process

1. **Automated checks**
   - All tests passing
   - No linting errors
   - Build successful

2. **Code review**
   - At least one approval required
   - Address review comments
   - Make requested changes

3. **Integration**
   - Merge to develop branch
   - Test integration
   - Deploy to staging

4. **Production**
   - Merge to main
   - Deploy to production
   - Monitor for issues

### Best Practices

- **Keep PRs focused**: One feature per PR
- **Keep PRs small**: Easier to review
- **Write clear descriptions**: Explain the change
- **Respond to comments**: Acknowledge feedback
- **Update based on feedback**: Make requested changes

## Documentation

### Code Documentation

**Document complex logic:**

```typescript
/**
 * Calculate shipping cost based on destination and weight
 *
 * Formula:
 * - Base rate: 500 JPY
 * - Per kg: 100 JPY
 * - Remote areas: +200 JPY
 *
 * @param postalCode - Destination postal code
 * @param weight - Package weight in kg
 * @returns Shipping cost in JPY
 */
function calculateShipping(postalCode: string, weight: number): number {
  // Implementation
}
```

### API Documentation

Update API docs for new endpoints:

```markdown
### POST /api/endpoint

Description of what this endpoint does.

**Request:**
\`\`\`json
{
  "field": "value"
}
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "data": { }
}
\`\`\`
```

### Component Documentation

Document component props and usage:

```typescript
/**
 * Button component with multiple variants
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click me
 * </Button>
 * ```
 */
export function Button(props: ButtonProps) {
  // ...
}
```

## Reporting Issues

### Before Creating an Issue

1. **Search existing issues**
   - Check if the issue is already reported
   - Add comments to existing issues if relevant

2. **Gather information**
   - Reproduce the issue
   - Note the steps to reproduce
   - Collect error messages
   - Note your environment

### Issue Template

```markdown
## Description
Clear description of the issue

## Steps to Reproduce
1. Go to...
2. Click on...
3. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Screenshots
Add screenshots if applicable

## Environment
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Node.js: [e.g., 18.17.0]
- npm: [e.g., 9.0.0]

## Additional Context
Add any other context about the problem
```

### Bug Report vs Feature Request

**Bug Report:**
- Something is broken
- Unexpected behavior
- Error occurs

**Feature Request:**
- New functionality
- Enhancement
- Improvement

## Getting Help

### Resources

- **Documentation**: [README.md](/README.md)
- **API Docs**: [docs/api.md](/docs/api.md)
- **Deployment Guide**: [docs/deployment.md](/docs/deployment.md)

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and ideas
- **Email**: dev@epackage-lab.com

### Asking Good Questions

1. **Be specific**: Describe what you're trying to do
2. **Show your work**: Include code snippets
3. **Mention what you've tried**: Show research
4. **Provide context**: Include relevant information

Example:

```
❌ Bad: "My code doesn't work"

✅ Good: "I'm trying to implement user authentication
but I'm getting a 401 error. Here's my code and the
error message I'm receiving. I've tried changing the
headers but that didn't help."
```

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation

Thank you for contributing to Epackage Lab Web!

---

For questions about contributing, contact: dev@epackage-lab.com

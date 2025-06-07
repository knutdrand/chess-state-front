# Testing Guide for Chess-State Frontend

This document provides comprehensive information about testing in the Chess-State frontend application.

## Test Structure

The test suite is organized into several categories:

### Unit Tests
- **Component Tests**: Test individual React components in isolation
- **Hook Tests**: Test custom React hooks like `useToken`
- **Utility Tests**: Test helper functions and utilities

### Integration Tests
- **User Flow Tests**: Test complete user interactions from login to gameplay
- **API Integration Tests**: Test component interactions with backend APIs

## Test Files

### Core Component Tests
- `src/App.test.js` - Main application routing and authentication flow
- `src/useToken.test.js` - Token management hook
- `src/components/PlayerStatus.test.js` - Player status component
- `src/components/Info.test.tsx` - Information display component
- `src/components/Login.test.js` - Login form component
- `src/components/Navigation.test.tsx` - Navigation bar component
- `src/components/GameScreen.test.js` - Main game interface

### Integration Tests
- `src/integration/userFlow.test.js` - Complete user journey tests

### Test Utilities
- `src/utils/testUtils.js` - Common testing utilities and mocks
- `src/setupTests.js` - Global test configuration

## Running Tests

### Basic Test Commands

```bash
# Run all tests in watch mode
npm test

# Run all tests once
npm run test:ci

# Run tests with coverage report
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run tests in watch mode (all files)
npm run test:watch
```

### Coverage Reports

Coverage reports are generated in the `coverage/` directory and include:
- HTML report: `coverage/lcov-report/index.html`
- LCOV format: `coverage/lcov.info`
- Text summary in terminal

### Coverage Thresholds

The project maintains minimum coverage thresholds:
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## Test Patterns and Best Practices

### Component Testing
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from './MyComponent';

test('renders component correctly', () => {
  render(<MyComponent prop="value" />);
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});
```

### Hook Testing
```javascript
import { renderHook, act } from '@testing-library/react';
import useMyHook from './useMyHook';

test('hook returns expected values', () => {
  const { result } = renderHook(() => useMyHook());
  expect(result.current.value).toBe('expected');
});
```

### API Mocking
```javascript
import axios from 'axios';
jest.mock('axios');
const mockedAxios = axios;

test('handles API calls', async () => {
  mockedAxios.get.mockResolvedValue({ data: { success: true } });
  // Test component that makes API call
});
```

### Chess.js Mocking
```javascript
import { Chess } from 'chess.js';
jest.mock('chess.js');

const mockChess = {
  fen: jest.fn(() => 'starting-position'),
  move: jest.fn(),
  turn: jest.fn(() => 'w'),
};
Chess.mockImplementation(() => mockChess);
```

## Common Test Utilities

### Mock Creators
- `createMockJWTToken()` - Creates mock JWT tokens
- `createMockChessGame()` - Creates mock Chess.js instances
- `createMockInitResponse()` - Creates mock API responses
- `createMockCourses()` - Creates mock course data

### Test Helpers
- `setupCommonMocks()` - Sets up common mocks for all tests
- `renderWithProviders()` - Renders components with necessary providers
- `mockLocalStorage` - Mock localStorage implementation

## Debugging Tests

### Running Specific Tests
```bash
# Run tests matching a pattern
npm test -- --testNamePattern="Login"

# Run tests in a specific file
npm test -- Login.test.js

# Run tests with verbose output
npm test -- --verbose
```

### Debug Mode
```bash
# Run tests in debug mode
npm test -- --debug

# Run with additional logging
npm test -- --verbose --no-cache
```

## Continuous Integration

The test suite is designed to run in CI environments:

```bash
# CI-friendly test command
npm run test:ci
```

This command:
- Runs all tests once (no watch mode)
- Generates coverage reports
- Exits with appropriate status codes
- Outputs results in CI-friendly format

## Test Data and Fixtures

### Mock Data
Test utilities provide realistic mock data for:
- JWT tokens with proper expiration
- Chess positions and moves
- API responses
- Course and chapter data

### Test Fixtures
Common test scenarios are provided as fixtures:
- Valid/invalid login attempts
- Chess game states
- API error responses
- User navigation flows

## Troubleshooting

### Common Issues

1. **Tests timing out**: Increase timeout or check for unresolved promises
2. **Mock not working**: Ensure mocks are set up before component render
3. **Coverage too low**: Add tests for uncovered branches and functions
4. **Flaky tests**: Check for race conditions and async operations

### Performance

- Tests run in parallel by default
- Use `--runInBand` for debugging race conditions
- Mock heavy dependencies like chess.js and axios

## Contributing

When adding new features:

1. Write tests for new components
2. Update existing tests if behavior changes
3. Maintain coverage thresholds
4. Add integration tests for new user flows
5. Update this documentation if needed

## Test Environment

Tests run in a jsdom environment with:
- React Testing Library
- Jest
- Mock implementations of browser APIs
- Mocked external dependencies

The test environment closely mimics the browser environment while providing fast, reliable test execution.

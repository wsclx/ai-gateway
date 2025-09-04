import { test, expect } from '@playwright/test';

test('API: create assistant via proxy', async ({ request }) => {
  const response = await request.post('/api/proxy/assistants', {
    data: {
      name: 'API Test Assistant',
      description: 'Created via API test',
      instructions: 'Be helpful',
      model: 'gpt-4o'
    }
  });
  
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  expect(data.name).toBe('API Test Assistant');
  expect(data.id).toBeDefined();
});

test('API: create user via proxy', async ({ request }) => {
  const response = await request.post('/api/proxy/admin/users', {
    data: {
      email: 'api.tester@example.com',
      display_name: 'API Tester',
      role: 'admin',
      department: 'IT'
    }
  });
  
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  expect(data.email).toContain('api.tester@example.com');
  expect(data.id).toBeDefined();
});

test('API: list assistants via proxy', async ({ request }) => {
  const response = await request.get('/api/proxy/assistants');
  
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  expect(Array.isArray(data)).toBeTruthy();
  expect(data.length).toBeGreaterThan(0);
});

test('API: list users via proxy', async ({ request }) => {
  const response = await request.get('/api/proxy/admin/users');
  
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  expect(Array.isArray(data)).toBeTruthy();
  expect(data.length).toBeGreaterThan(0);
});

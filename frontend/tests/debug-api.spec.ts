import { test, expect } from '@playwright/test';

test('Debug: Test POST request details', async ({ request }) => {
  console.log('Testing POST request to /api/proxy/assistants');
  
  const createResponse = await request.post('/api/proxy/assistants', {
    data: {
      name: 'Debug Test Assistant',
      description: 'Debug test',
      instructions: 'Be helpful',
      model: 'gpt-4o'
    }
  });
  
  console.log('Response status:', createResponse.status());
  console.log('Response status text:', createResponse.statusText());
  console.log('Response headers:', createResponse.headers());
  
  const responseText = await createResponse.text();
  console.log('Response body:', responseText);
  
  expect(createResponse.ok()).toBeTruthy();
});

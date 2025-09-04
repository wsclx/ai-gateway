import { test, expect } from '@playwright/test';

test.describe('Critical Functions E2E Tests', () => {
  test('API: All critical endpoints work', async ({ request }) => {
    // Test assistants
    const assistantsResponse = await request.get('http://localhost:5555/api/v1/assistants');
    expect(assistantsResponse.ok()).toBeTruthy();
    const assistants = await assistantsResponse.json();
    expect(Array.isArray(assistants)).toBeTruthy();
    expect(assistants.length).toBeGreaterThan(0);

    // Test users
    const usersResponse = await request.get('http://localhost:5555/api/v1/admin/users');
    expect(usersResponse.ok()).toBeTruthy();
    const users = await usersResponse.json();
    expect(Array.isArray(users)).toBeTruthy();
    expect(users.length).toBeGreaterThan(0);

    // Test analytics
    const analyticsResponse = await request.get('http://localhost:5555/api/v1/analytics/overview');
    expect(analyticsResponse.ok()).toBeTruthy();
    const analytics = await analyticsResponse.json();
    expect(analytics.overview).toBeDefined();
    expect(analytics.usage).toBeDefined();

    // Test admin config
    const configResponse = await request.get('http://localhost:5555/api/v1/admin/config');
    expect(configResponse.ok()).toBeTruthy();
    const config = await configResponse.json();
    expect(config.retentionDays).toBeDefined();
    expect(config.enableAnalytics).toBeDefined();
  });

  test('API: Create assistant and verify', async ({ request }) => {
    // Add a small delay to ensure the backend is ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const timestamp = Date.now();
    const testData = {
      name: `Critical Test Assistant ${timestamp}`,
      description: 'Created during critical functions test',
      instructions: 'Be helpful and accurate',
      model: 'gpt-4o'
    };

    console.log('Creating assistant with data:', testData);
    
    const createResponse = await request.post('http://localhost:5555/api/v1/assistants', {
      data: testData
    });
    
    console.log('Create response status:', createResponse.status());
    console.log('Create response status text:', createResponse.statusText());
    
    if (!createResponse.ok()) {
      const errorText = await createResponse.text();
      console.log('Error response:', errorText);
      throw new Error(`POST request failed with status ${createResponse.status()}: ${errorText}`);
    }
    
    const created = await createResponse.json();
    expect(created.name).toBe(`Critical Test Assistant ${timestamp}`);
    expect(created.id).toBeDefined();

    // Verify it appears in the list
    const listResponse = await request.get('http://localhost:5555/api/v1/assistants');
    expect(listResponse.ok()).toBeTruthy();
    const assistants = await listResponse.json();
    const found = assistants.find((a: any) => a.id === created.id);
    expect(found).toBeDefined();
    expect(found.name).toBe(`Critical Test Assistant ${timestamp}`);
  });

  test('API: Create user and verify', async ({ request }) => {
    // Add a small delay to ensure the backend is ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const timestamp = Date.now();
    const testData = {
      email: `critical.tester.${timestamp}@example.com`,
      display_name: 'Critical Tester',
      role: 'admin',
      department: 'IT'
    };

    console.log('Creating user with data:', testData);
    
    const createResponse = await request.post('http://localhost:5555/api/v1/admin/users', {
      data: testData
    });
    
    console.log('Create response status:', createResponse.status());
    console.log('Create response status text:', createResponse.statusText());
    
    if (!createResponse.ok()) {
      const errorText = await createResponse.text();
      console.log('Error response:', errorText);
      throw new Error(`POST request failed with status ${createResponse.status()}: ${errorText}`);
    }
    
    const created = await createResponse.json();
    expect(created.email).toContain(`critical.tester.${timestamp}@example.com`);
    expect(created.id).toBeDefined();

    // Verify it appears in the list
    const listResponse = await request.get('http://localhost:5555/api/v1/admin/users');
    expect(listResponse.ok()).toBeTruthy();
    const users = await listResponse.json();
    const found = users.find((u: any) => u.id === created.id);
    expect(found).toBeDefined();
    expect(found.email).toContain(`critical.tester.${timestamp}@example.com`);
  });

  test('API: Analytics data structure', async ({ request }) => {
    const response = await request.get('http://localhost:5555/api/v1/analytics/overview');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    // Check overview structure
    expect(data.overview).toBeDefined();
    expect(typeof data.overview.totalMessages).toBe('number');
    expect(typeof data.overview.totalTokens).toBe('number');
    expect(typeof data.overview.totalCost).toBe('number');
    expect(typeof data.overview.activeUsers).toBe('number');
    expect(typeof data.overview.totalAssistants).toBe('number');

    // Check usage structure
    expect(data.usage).toBeDefined();
    expect(Array.isArray(data.usage.daily)).toBeTruthy();
    expect(Array.isArray(data.usage.byDepartment)).toBeTruthy();
    expect(Array.isArray(data.usage.byAssistant)).toBeTruthy();

    // Check performance structure
    expect(data.performance).toBeDefined();
    expect(data.performance.responseTime).toBeDefined();
    expect(data.performance.accuracy).toBeDefined();
    expect(data.performance.userSatisfaction).toBeDefined();
  });

  test('API: Admin config structure', async ({ request }) => {
    const response = await request.get('http://localhost:5555/api/v1/admin/config');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(typeof data.openaiApiKey).toBe('boolean');
    expect(typeof data.anthropicApiKey).toBe('boolean');
    expect(typeof data.retentionDays).toBe('number');
    expect(typeof data.redactionEnabled).toBe('boolean');
    expect(typeof data.budgetMonthlyCents).toBe('number');
    expect(typeof data.costAlertThresholdCents).toBe('number');
    expect(typeof data.featureDemoMode).toBe('boolean');
    expect(typeof data.enableAnalytics).toBe('boolean');
  });
});

import { test, expect } from '@playwright/test';

test.describe('Legacy TODO App - Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the TODO app
    await page.goto('/');
  });

  test('should load the app successfully', async ({ page }) => {
    // Check that the page title is correct
    await expect(page).toHaveTitle('Legacy TODO App');
    
    // Check that the main header is visible
    await expect(page.locator('h1')).toContainText('Legacy TODO App');
    await expect(page.locator('.todo-header p')).toContainText('Built with React 16, Redux, and Saga');
  });

  test('should display the todo form', async ({ page }) => {
    // Check that the form elements are present
    const input = page.locator('input[placeholder="What needs to be done?"]');
    const addButton = page.locator('button', { hasText: 'Add Todo' });
    
    await expect(input).toBeVisible();
    await expect(addButton).toBeVisible();
    
    // Verify form is initially empty
    await expect(input).toHaveValue('');
  });

  test('should show empty state initially', async ({ page }) => {
    // Should show empty state message
    await expect(page.locator('text=No todos yet. Add one above!')).toBeVisible();
  });

  test('should clear input after form submission', async ({ page }) => {
    const input = page.locator('input[placeholder="What needs to be done?"]');
    const addButton = page.locator('button', { hasText: 'Add Todo' });
    
    // Fill and submit the form
    await input.fill('Test todo item');
    await addButton.click();
    
    // Input should be cleared
    await expect(input).toHaveValue('');
  });

  test('should submit form with Enter key', async ({ page }) => {
    const input = page.locator('input[placeholder="What needs to be done?"]');
    
    // Fill and submit with Enter
    await input.fill('Todo with Enter key');
    await input.press('Enter');
    
    // Input should be cleared
    await expect(input).toHaveValue('');
  });

  test('should not submit empty todos', async ({ page }) => {
    const input = page.locator('input[placeholder="What needs to be done?"]');
    const addButton = page.locator('button', { hasText: 'Add Todo' });
    
    // Try to submit empty form
    await addButton.click();
    
    // Should still show empty state
    await expect(page.locator('text=No todos yet. Add one above!')).toBeVisible();
  });

  test('should have working filter buttons', async ({ page }) => {
    // Check that filter buttons are present
    await expect(page.locator('button', { hasText: 'All' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Active' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Completed' })).toBeVisible();
    
    // All button should be active by default
    await expect(page.locator('button', { hasText: 'All' })).toHaveClass(/active/);
  });

  test('should support keyboard navigation', async ({ page }) => {
    const input = page.locator('input[placeholder="What needs to be done?"]');
    const addButton = page.locator('button').filter({ hasText: 'Add Todo' });
    
    // Ensure elements are visible and ready
    await expect(input).toBeVisible();
    await expect(addButton).toBeVisible();
    
    // Focus input and tab to button
    await input.focus();
    await expect(input).toBeFocused();
    
    await input.press('Tab');
    await page.waitForTimeout(100); // Small delay for webkit
    await expect(addButton).toBeFocused();
  });

  test('should load without JavaScript errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    
    // Wait for the app to fully load
    await expect(page.locator('h1')).toContainText('Legacy TODO App');
    await page.waitForTimeout(2000); // Wait for any async operations
    
    // Check that no critical console errors occurred
    // Filter out common harmless warnings
    const criticalErrors = errors.filter(error => 
      !error.includes('Warning:') && 
      !error.includes('DevTools') &&
      !error.includes('favicon.ico')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('should be responsive', async ({ page }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // App should still load and be usable
    await expect(page.locator('h1')).toContainText('Legacy TODO App');
    await expect(page.locator('input[placeholder="What needs to be done?"]')).toBeVisible();
    await expect(page.locator('button', { hasText: 'Add Todo' })).toBeVisible();
  });
});
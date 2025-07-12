import { test, expect } from '@playwright/test';

test.describe('Legacy TODO App - Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the app title and header', async ({ page }) => {
    // Check that the page title is correct
    await expect(page).toHaveTitle('Legacy TODO App');
    
    // Check that the main header is visible
    await expect(page.locator('h1')).toContainText('Legacy TODO App');
    await expect(page.locator('.todo-header p')).toContainText('Built with React 16, Redux, and Saga');
  });

  test('should have a working todo form', async ({ page }) => {
    // Check that the form elements are present and functional
    const input = page.locator('input[placeholder="What needs to be done?"]');
    const addButton = page.locator('button', { hasText: 'Add Todo' });
    
    await expect(input).toBeVisible();
    await expect(addButton).toBeVisible();
    
    // Verify form is initially empty
    await expect(input).toHaveValue('');
    
    // Verify form can accept input
    await input.fill('Test todo input');
    await expect(input).toHaveValue('Test todo input');
  });

  test('should clear input after form submission', async ({ page }) => {
    const input = page.locator('input[placeholder="What needs to be done?"]');
    const addButton = page.locator('button', { hasText: 'Add Todo' });
    
    // Add a new todo via button
    await input.fill('Test todo item from button');
    await addButton.click();
    
    // Check that the input was cleared
    await expect(input).toHaveValue('');
  });

  test('should handle Enter key submission', async ({ page }) => {
    const input = page.locator('input[placeholder="What needs to be done?"]');
    
    // Add a new todo via Enter key
    await input.fill('Test todo item from Enter');
    await input.press('Enter');
    
    // Check that the input was cleared
    await expect(input).toHaveValue('');
  });

  test('should not submit empty todos', async ({ page }) => {
    const input = page.locator('input[placeholder="What needs to be done?"]');
    const addButton = page.locator('button', { hasText: 'Add Todo' });
    
    // Try to submit empty form
    await addButton.click();
    
    // Input should remain empty and no change should occur
    await expect(input).toHaveValue('');
    
    // Should still show empty state
    await expect(page.locator('text=No todos yet. Add one above!')).toBeVisible();
  });

  test('should not submit whitespace-only todos', async ({ page }) => {
    const input = page.locator('input[placeholder="What needs to be done?"]');
    
    // Try to submit whitespace
    await input.fill('   ');
    await input.press('Enter');
    
    // Input should be cleared since whitespace is trimmed
    await expect(input).toHaveValue('');
  });

  test('should display filter buttons', async ({ page }) => {
    // Check that filter buttons are present and functional
    const allButton = page.locator('button', { hasText: 'All' });
    const activeButton = page.locator('button', { hasText: 'Active' });
    const completedButton = page.locator('button', { hasText: 'Completed' });
    
    await expect(allButton).toBeVisible();
    await expect(activeButton).toBeVisible();
    await expect(completedButton).toBeVisible();
    
    // All button should be active by default
    await expect(allButton).toHaveClass(/active/);
    
    // Test filter button interactions
    await activeButton.click();
    await expect(activeButton).toHaveClass(/active/);
    await expect(allButton).not.toHaveClass(/active/);
    
    await completedButton.click();
    await expect(completedButton).toHaveClass(/active/);
    await expect(activeButton).not.toHaveClass(/active/);
    
    await allButton.click();
    await expect(allButton).toHaveClass(/active/);
    await expect(completedButton).not.toHaveClass(/active/);
  });

  test('should support keyboard navigation', async ({ page }) => {
    const input = page.locator('input[placeholder="What needs to be done?"]');
    const addButton = page.locator('button').filter({ hasText: 'Add Todo' });
    
    // Ensure elements are visible and ready
    await expect(input).toBeVisible();
    await expect(addButton).toBeVisible();
    
    // Test Tab navigation
    await input.focus();
    await expect(input).toBeFocused();
    
    await input.press('Tab');
    await page.waitForTimeout(100); // Small delay for webkit
    await expect(addButton).toBeFocused();
    
    // Test Shift+Tab navigation
    await addButton.press('Shift+Tab');
    await page.waitForTimeout(100); // Small delay for webkit
    await expect(input).toBeFocused();
  });

  test('should show initial empty state', async ({ page }) => {
    // Verify empty state is displayed initially
    await expect(page.locator('text=No todos yet. Add one above!')).toBeVisible();
    
    // Verify todo count shows 0 initially
    await expect(page.locator('text=0 of 0 remaining')).toBeVisible();
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
    
    // Filter out known harmless errors
    const criticalErrors = errors.filter(error => 
      !error.includes('Warning:') && 
      !error.includes('DevTools') &&
      !error.includes('favicon.ico') &&
      !error.includes('manifest.json')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // App should still be functional
    await expect(page.locator('h1')).toContainText('Legacy TODO App');
    await expect(page.locator('input[placeholder="What needs to be done?"]')).toBeVisible();
    await expect(page.locator('button', { hasText: 'Add Todo' })).toBeVisible();
    
    // Form should still work
    const input = page.locator('input[placeholder="What needs to be done?"]');
    await input.fill('Mobile test');
    await input.press('Enter');
    await expect(input).toHaveValue('');
  });

  test('should handle rapid form submissions', async ({ page }) => {
    const input = page.locator('input[placeholder="What needs to be done?"]');
    
    // Rapidly submit multiple forms
    for (let i = 1; i <= 5; i++) {
      await input.fill(`Rapid todo ${i}`);
      await input.press('Enter');
      await expect(input).toHaveValue('');
      await page.waitForTimeout(100); // Small delay between submissions
    }
  });

  test('should handle special characters in input', async ({ page }) => {
    const input = page.locator('input[placeholder="What needs to be done?"]');
    
    const specialText = 'Todo with special chars: áéíóú ñ @#$%^&*()';
    await input.fill(specialText);
    await expect(input).toHaveValue(specialText);
    
    await input.press('Enter');
    await expect(input).toHaveValue('');
  });

  test('should handle very long input text', async ({ page }) => {
    const input = page.locator('input[placeholder="What needs to be done?"]');
    
    const longText = 'This is a very long todo item that tests how the application handles extremely long input text without breaking or causing any issues with the user interface or functionality';
    await input.fill(longText);
    await expect(input).toHaveValue(longText);
    
    await input.press('Enter');
    await expect(input).toHaveValue('');
  });
});
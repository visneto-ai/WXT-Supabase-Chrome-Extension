import { test, expect } from '@playwright/test';

test.describe('Authentication E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('chrome-extension://[extension-id]/sidepanel.html');
  });

  test('should successfully complete signup flow', async ({ page }) => {
    // Click signup link
    await page.getByText('Sign Up').click();

    // Fill signup form
    await page.getByPlaceholder('Email').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('Password123!');
    await page.getByPlaceholder('Confirm Password').fill('Password123!');

    // Submit form
    await page.getByRole('button', { name: 'Sign Up' }).click();

    // Verify successful signup
    await expect(page.getByText('Welcome!')).toBeVisible();
    await expect(page.getByText('test@example.com')).toBeVisible();
  });

  test('should handle login with email/password', async ({ page }) => {
    // Fill login form
    await page.getByPlaceholder('Email').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('Password123!');

    // Submit form
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Verify successful login
    await expect(page.getByText('Welcome!')).toBeVisible();
    await expect(page.getByText('test@example.com')).toBeVisible();
  });

  test('should handle Google OAuth login', async ({ page }) => {
    // Click Google login button
    await page.getByRole('button', { name: /Continue with Google/i }).click();

    // Handle Google OAuth popup
    const googlePopup = await page.waitForEvent('popup');
    await googlePopup.waitForLoadState();

    // Fill Google credentials (in real tests, use test account)
    await googlePopup.getByLabel('Email').fill('test@gmail.com');
    await googlePopup.getByRole('button', { name: 'Next' }).click();
    await googlePopup.getByLabel('Password').fill('googlepass123');
    await googlePopup.getByRole('button', { name: 'Next' }).click();

    // Verify successful Google login
    await expect(page.getByText('Welcome!')).toBeVisible();
    await expect(page.getByText('test@gmail.com')).toBeVisible();
  });

  test('should handle profile management', async ({ page }) => {
    // Login first
    await page.getByPlaceholder('Email').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('Password123!');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Verify profile information
    await expect(page.getByText('Role: User')).toBeVisible();
    await expect(page.getByText('Email: test@example.com')).toBeVisible();

    // Verify custom data display
    await expect(page.getByText('preferences')).toBeVisible();

    // Test sign out
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await expect(page.getByText('Sign In')).toBeVisible();
  });

  test('should handle error states', async ({ page }) => {
    // Test invalid credentials
    await page.getByPlaceholder('Email').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    await expect(page.getByText('Invalid credentials')).toBeVisible();

    // Test network error
    await page.route('**/auth/**', route => route.abort('internetdisconnected'));
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    await expect(page.getByText(/network error/i)).toBeVisible();
  });
});
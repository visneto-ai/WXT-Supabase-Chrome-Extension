/**
 * Types of notifications that can be displayed on the extension icon
 * @type {('success'|'error'|'loading')}
 */
type NotificationType = 'success' | 'error' | 'loading';

/**
 * Configuration for notification appearance
 * @interface NotificationConfig
 * @property {string} title - The title text to display in the tooltip
 * @property {string} icon - The emoji icon to display as badge
 */
interface NotificationConfig {
  title: string;
  icon: string;
}

/**
 * Mapping of notification types to their configurations
 * @constant {Record<NotificationType, NotificationConfig>}
 */
const NOTIFICATION_MAP: Record<NotificationType, NotificationConfig> = {
  success: {
    title: "Success",
    icon: "✅",
  },
  error: {
    title: "Error",
    icon: "❌",
  },
  loading: {
    title: "Loading",
    icon: "⏳",
  }
};

/**
 * Updates the extension icon with a notification badge
 * @async
 * @function updateIcon
 * @param {NotificationType} type - Type of notification ('success', 'error', or 'loading')
 * @param {string} message - Message to display in the tooltip
 * @returns {Promise<void>}
 * 
 * @example
 * // Show success notification
 * await updateIcon('success', 'Login successful');
 * 
 * @example
 * // Show error notification
 * await updateIcon('error', 'Authentication failed');
 * 
 * @throws {Error} When browser API calls fail
 * @description
 * - Shows a badge with an emoji icon on the extension icon
 * - Updates the tooltip with the notification message
 * - Changes badge background color based on type (green for success, red for error)
 * - Automatically resets after 5 seconds
 */
/**
 * Default timeout for notifications in milliseconds
 * @constant {number}
 */
const DEFAULT_TIMEOUT = 5000;

/**
 * Badge background colors for different notification types
 * @constant {Record<NotificationType, string>}
 */
const BADGE_COLORS: Record<NotificationType, string> = {
  success: '#198754',
  error: '#DC3545',
  loading: '#FFC107'
};

/**
 * Resets the extension icon badge and title
 * @async
 * @throws {Error} When browser API calls fail
 */
const resetBadge = async (): Promise<void> => {
  try {
    await Promise.all([
      browser.action.setBadgeText({ text: "" }),
      browser.action.setTitle({ title: "Supabase Auth Extension" })
    ]);
  } catch (error) {
    console.error('Error resetting badge:', error);
    throw new Error('Failed to reset extension badge');
  }
};

export const updateIcon = async (
  type: NotificationType, 
  message: string, 
  timeout: number = DEFAULT_TIMEOUT
): Promise<void> => {
  let resetTimer: NodeJS.Timeout;

  try {
    // Validate inputs
    if (!type || !message) {
      throw new Error('Type and message are required');
    }

    if (!NOTIFICATION_MAP[type]) {
      throw new Error(`Invalid notification type: ${type}`);
    }

    // Clear any existing timer
    // Store the current timer ID to clear it if needed
    // Store the current timer ID to clear it if needed
    if (typeof resetTimer !== 'undefined') {
      clearTimeout(resetTimer);
    }

    const { icon, title } = NOTIFICATION_MAP[type];
    
    // Update badge and title
    await Promise.all([
      browser.action.setBadgeText({ text: icon }),
      browser.action.setTitle({ title: `${title}: ${message}` }),
      browser.action.setBadgeBackgroundColor({ color: BADGE_COLORS[type] })
    ]).catch(error => {
      console.error('Failed to update badge:', error);
      throw new Error('Failed to update extension badge');
    });

    // Set reset timer if timeout is positive
    if (timeout > 0) {
      resetTimer = setTimeout(async () => {
        try {
          await resetBadge();
        } catch (error) {
          console.error('Failed to reset badge:', error);
        }
      }, timeout);
    }
  } catch (error) {
    console.error('Error in updateIcon:', error);
    // Try to show error on badge
    try {
      await Promise.all([
        browser.action.setBadgeText({ text: '!' }),
        browser.action.setTitle({ 
          title: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }),
        browser.action.setBadgeBackgroundColor({ color: BADGE_COLORS.error })
      ]);
    } catch (badgeError) {
      console.error('Failed to show error badge:', badgeError);
    }
    throw error; // Re-throw for caller handling
  }
};

// Export for testing purposes
export const __testing__ = {
  resetBadge,
  DEFAULT_TIMEOUT,
  BADGE_COLORS
};
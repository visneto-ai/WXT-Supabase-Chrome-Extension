/**
 * Configures the side panel to open when the extension icon is clicked
 */
export const setupSidePanelBehavior = async (): Promise<void> => {
    try {
      await browser.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    } catch (error) {
      console.error('Failed to setup side panel behavior:', error);
    }
  };
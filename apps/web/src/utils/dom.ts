/**
 * HACK: show renaming status when menu tree item first created
 */
export const dbclickMenuTreeItemAfterCreate = (renamingMenuItemId: string) => {
  let done = false; // Control flag

  const checkAndDispatch = (retry = 20) => {
    if (done) return; // Skip if already completed

    const element = document.querySelector(`.tree-item-child.${renamingMenuItemId}`);

    if (element) {
      const event = new MouseEvent("dblclick", {
        bubbles: true,
        cancelable: true,
        view: window,
      });

      element.dispatchEvent(event);
      console.log("--- dbclick success ---", retry);
      done = true; // Mark done on success
    } else if (retry > 0) {
      setTimeout(() => checkAndDispatch(retry - 1), 100);
    } else {
      console.log("--- dbclick failed: element not found ---");
    }
  };

  checkAndDispatch();
};

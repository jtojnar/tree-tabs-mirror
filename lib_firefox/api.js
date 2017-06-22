'use strict';

const {classes: Cc, interfaces: Ci, results: Cr, utils: Cu} = Components;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "ExtensionParent",
                              "resource://gre/modules/ExtensionParent.jsm");

const windowTracker = ExtensionParent.apiManager.global.windowTracker;

let tabsVisible = true;
let observerList = []

// We use the collapsed property instead of the hidden property so we don't
// cutoff tab events.
function hideTabs (window) {
  let toolbar = window.document.getElementById("TabsToolbar");
  toolbar.collapsed = true;
  let observer = new window.MutationObserver(mutations =>
    mutations.forEach(mutation => {
      if (!mutation.target.collapsed) {
        mutation.target.collapsed = true;
      }
    })
  ).observe(toolbar, {attributes: true, attributeFilter: ["collapsed"]});
  observerList.push(observer);
}

class API extends ExtensionAPI {
  getAPI(context) {
    return {
      tabstrip: {
        setTabsVisible (visible) {
          if (visible) {
            observerList.forEach(observer => observer.disconnect())
            observerList = []
            windowTracker.off('open', hideTabs)
            for (let window of windowTracker.browserWindows()) {
              let toolbar = window.document.getElementById('TabsToolbar');
              toolbar.collapsed = false;
            }
          } else {
            windowTracker.on('open', hideTabs)
            for (let window of windowTracker.browserWindows()) {
              hideTabs(window)
            }
          }

          tabsVisible = visible;
        },

        getTabsVisible () {
          return tabsVisible;
        }
      }
    };
  }
}

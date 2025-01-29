import { updateIcon } from "@/util/browser-action";
import { setupSidePanelBehavior } from "@/util/side-panel";

export default defineBackground(() => ({
  type: "module", //service worker in MV3
  main() {
    //Executed when background is loaded, CANNOT BE ASYNC
    console.log("background loaded");

    console: console.log("Hello background!", { id: browser.runtime.id });


    setupSidePanelBehavior();
    updateIcon('success',"Success");


  },
  persistent: true
}));

import SavestateHandler from "../../savestate/SavestateHandler.js";
import ExitStateManager from "../../statemanager/world/exit/ExitStateManager.js";
import Logic from "../logic/Logic.js";
import LogicExitAugmentor from "../logic/LogicExitAugmentor.js";

const AUGMENTORS = new Set();

function initRedirects() {
    Logic.clearRedirects();
    const initTransalation = [];
    for (const entry of AUGMENTORS) {
        if (entry.exit.isVisible()) {
            LogicExitAugmentor.applyBinding(initTransalation, entry.exit.ref, entry.exit.value);
        }
    }
    if (initTransalation.length) {
        Logic.setRedirect(initTransalation, "region.root");
    }
}

SavestateHandler.addEventListener("afterload", () => {
    initRedirects();
});

// scoped init
{
    const MISSING_ENTRANCES = new Set();
    const DONE_ENTRANCES = new Set();
    for (const [ref, exit] of ExitStateManager) {
        AUGMENTORS.add(new LogicExitAugmentor(ref));
        DONE_ENTRANCES.add(ref);
        MISSING_ENTRANCES.delete(ref);
        // reverse exits
        if (!DONE_ENTRANCES.has(exit.props.target)) {
            MISSING_ENTRANCES.add(exit.props.target);
        }
    }

    for (const ref of MISSING_ENTRANCES) {
        console.warn("entrance missing: ", ref);
    }

    initRedirects();
}

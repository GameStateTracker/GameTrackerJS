import WorldStateManagerRegistry from "../../WorldStateManagerRegistry.js";
import WorldStateManager from "../WorldStateManager.js";
import DefaultEntranceState from "../../../state/world/entrance/DefaultEntranceState.js";

class EntranceStateManager extends WorldStateManager {

    constructor() {
        super(DefaultEntranceState, "exit");
    }

}

const entranceStateManager = new EntranceStateManager();
if (!WorldStateManagerRegistry.has("entrance")) {
    WorldStateManagerRegistry.register("entrance", entranceStateManager);
}

export default entranceStateManager;

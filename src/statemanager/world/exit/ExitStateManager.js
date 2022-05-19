import WorldStateManagerRegistry from "../../WorldStateManagerRegistry.js";
import WorldStateManager from "../WorldStateManager.js";
import DefaultExitState from "../../../state/world/exit/DefaultExitState.js";

class ExitStateManager extends WorldStateManager {

    constructor() {
        super(DefaultExitState, "exit");
    }

}

const exitStateManager = new ExitStateManager();
if (!WorldStateManagerRegistry.has("exit")) {
    WorldStateManagerRegistry.register("exit", exitStateManager);
}

export default exitStateManager;

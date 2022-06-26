import WorldStateManagerRegistry from "../../WorldStateManagerRegistry.js";
import WorldStateManager from "../WorldStateManager.js";
import DefaultExitState from "../../../state/world/exit/DefaultExitState.js";

const ExitStateManager = new WorldStateManager(DefaultExitState, "exit");
if (!WorldStateManagerRegistry.has("exit")) {
    WorldStateManagerRegistry.register("exit", ExitStateManager);
}

export default ExitStateManager;

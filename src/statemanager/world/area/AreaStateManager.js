import WorldStateManagerRegistry from "../../WorldStateManagerRegistry.js";
import WorldStateManager from "../WorldStateManager.js";
import DefaultAreaState from "../../../state/world/area/DefaultAreaState.js";

const AreaStateManager = new WorldStateManager(DefaultAreaState, "areas");
if (!WorldStateManagerRegistry.has("Area")) {
    WorldStateManagerRegistry.register("Area", AreaStateManager);
}

export default AreaStateManager;

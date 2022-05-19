import WorldStateManagerRegistry from "../../WorldStateManagerRegistry.js";
import WorldStateManager from "../WorldStateManager.js";
import DefaultAreaState from "../../../state/world/area/DefaultAreaState.js";

class AreaStateManager extends WorldStateManager {

    constructor() {
        super(DefaultAreaState, "area");
    }

}

const areaStateManager = new AreaStateManager();
if (!WorldStateManagerRegistry.has("area")) {
    WorldStateManagerRegistry.register("area", areaStateManager);
}

export default areaStateManager;

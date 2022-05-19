import WorldStateManagerRegistry from "../../WorldStateManagerRegistry.js";
import WorldStateManager from "../WorldStateManager.js";
import DefaultCollectionState from "../../../state/world/collection/DefaultCollectionState.js";

class CollectionStateManager extends WorldStateManager {

    constructor() {
        super(DefaultCollectionState, "collection");
    }

}

const collectionStateManager = new CollectionStateManager();
if (!WorldStateManagerRegistry.has("collection")) {
    WorldStateManagerRegistry.register("collection", collectionStateManager);
}

export default collectionStateManager;

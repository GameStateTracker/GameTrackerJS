import ItemsRecource from "../../resource/ItemsResource.js";
import AbstractStateManager from "../../statemanager/AbstractStateManager.js";
import DefaultItemState from "./DefaultState.js";

const resourceData = ItemsRecource.get();

class ItemStateManager extends AbstractStateManager {

    constructor() {
        super(DefaultItemState, resourceData);
    }

    createState(StateClass, ref, props) {
        return new StateClass(ref, props);
    }

}

export default new ItemStateManager();

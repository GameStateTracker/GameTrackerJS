import AppStateMetaObserver from "/emcJS/util/observer/data/state/AppStateMetaObserver.js";
import savestate from "../../savestate/Savestate.js";

export default class MetaObserver extends AppStateMetaObserver {

    constructor(key) {
        super(savestate, key);
    }

}

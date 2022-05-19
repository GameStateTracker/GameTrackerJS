// frameworks
import LogicHandler from "/emcJS/util/logic/LogicHandler.js";

import LogicDataCollector from "../logic/LogicDataCollector.js";

const EVENTS = ["load", "change"];

export default class TrackerLogicHandler extends LogicHandler {

    constructor(logic = true) {
        super(LogicDataCollector, logic, EVENTS);
    }

}

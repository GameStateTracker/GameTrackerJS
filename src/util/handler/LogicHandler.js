import LogicHandler from "@emcjs/core/util/logic/processor/LogicHandler.js";
import LogicDataCollector from "../logic/TrackerLogicDataCollector.js";

const EVENTS = ["load", "change"];

export default class TrackerLogicHandler extends LogicHandler {

    constructor(logic = true) {
        super(LogicDataCollector, logic, EVENTS);
    }

}

import Logger from "/emcJS/util/log/Logger.js";
import TypeConfigMap from "/emcJS/data/type/TypeConfigMap.js";
import TYPES from "../../../../_types" assert {type: "json-folder"};

try {
    TypeConfigMap.registerAll(TYPES);
} catch (err) {
    Logger.error(err);
}

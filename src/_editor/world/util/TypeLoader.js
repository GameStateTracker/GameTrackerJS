import Logger from "@emcjs/core/util/log/Logger.js";
import TypeConfigMap from "@emcjs/core/data/type/TypeConfigMap.js";
import TYPES from "../../../../_types" assert {type: "json-folder"};

try {
    TypeConfigMap.registerAll(TYPES);
} catch (err) {
    Logger.error(err);
}

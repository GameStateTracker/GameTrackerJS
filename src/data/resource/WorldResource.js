import JSONCResource from "/emcJS/data/resource/file/JSONCResource.js";

const WorldResource = await JSONCResource.get("/database/world.json")

export default WorldResource;

const CONFIG = WorldResource.get("config");

const REGION_ROOT = CONFIG.region?.root ?? "root";
const REGION_PREFIX = CONFIG.region?.prefix ?? "";
const REGION_POSTFIX = CONFIG.region?.postfix ?? "";

export function getRegion(value) {
    const region = value ?? REGION_ROOT;
    return `${REGION_PREFIX}${region}${REGION_POSTFIX}`;
}

const GATEWAYS_PREFIX_IN = CONFIG.gateways?.incoming?.prefix ?? "";
const GATEWAYS_POSTFIX_IN = CONFIG.gateways?.incoming?.postfix ?? "";
const GATEWAYS_PREFIX_OUT = CONFIG.gateways?.outgoing?.prefix ?? "";
const GATEWAYS_POSTFIX_OUT = CONFIG.gateways?.outgoing?.postfix ?? "";

export function getGatewayIn(value) {
    const region = value ?? REGION_ROOT;
    const gateway = `${GATEWAYS_PREFIX_IN}${region}${GATEWAYS_POSTFIX_IN}`;
    return getRegion(gateway);
}

export function getGatewayOut(value) {
    const region = value ?? REGION_ROOT;
    const gateway = `${GATEWAYS_PREFIX_OUT}${region}${GATEWAYS_POSTFIX_OUT}`;
    return getRegion(gateway);
}

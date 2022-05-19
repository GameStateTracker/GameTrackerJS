// frameworks
import ClassRegistry from "/emcJS/util/ClassRegistry.js";

const CATEGORIES = new Map();

export default class UIRegistry extends ClassRegistry {

    create(type, ref = "") {
        const el = super.create(type);
        el.ref = ref;
        return el;
    }

    static set(category, registry) {
        if (!(registry instanceof UIRegistry)) {
            throw new TypeError("registry has to be a UIRegistry");
        }
        if (CATEGORIES.has(category)) {
            throw new Error(`category "${category}" already exists in UIRegistry`);
        }
        CATEGORIES.set(category, registry);
    }

    static get(category) {
        return CATEGORIES.get(category);
    }

}

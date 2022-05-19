// frameworks
import FileLoader from "/emcJS/util/FileLoader.js";

const PROXY_HANDLER = {
    get(target, key) {
        if (typeof key == "symbol") {
            return target[key];
        }
        const path = key.split("/");
        let ref;
        while (!ref && path.length) {
            ref = path.shift();
        }
        if (!ref) {
            return;
        }
        const res = target[ref];
        if (res == null) {
            return;
        }
        if (path.length) {
            if (typeof res == "object") {
                return res[path.join("/")];
            } else {
                return;
            }
        } else {
            return res;
        }
    },
    set() {},
    deleteProperty() {},
    defineProperty() {}
};

function buildRecursiveProxy(data) {
    if (typeof data == "object") {
        if (Array.isArray(data)) {
            const res = data.map(buildRecursiveProxy);
            return new Proxy(res, PROXY_HANDLER);
        } else {
            const res = {};
            for (const key in data) {
                const value = data[key];
                res[key] = buildRecursiveProxy(value);
            }
            return new Proxy(res, PROXY_HANDLER);
        }
    }
    return data;
}

const DATA = new WeakMap();

export default class JSONCResourceFile extends EventTarget {

    constructor(src) {
        super();
        // ---
        if (src != null) {
            FileLoader.jsonc(src).then(data => {
                const proxyData = buildRecursiveProxy(data);
                DATA.set(this, proxyData);
                const ev = new Event("load");
                ev.data = proxyData;
                this.dispatchEvent(ev);
            }).catch(err => {
                console.warn(err);
                DATA.set(this, {});
                const ev = new Event("error");
                this.dispatchEvent(ev);
            });
        } else {
            DATA.set(this, {});
        }
    }

    get(path) {
        const data = DATA.get(this);
        if (typeof path == "string" && !!path) {
            return data[path];
        } else {
            return data;
        }
    }

    static create(path) {
        return new Promise((resolve, reject) => {
            const resource = new JSONCResourceFile(path);
            resource.addEventListener("load", () => {
                resolve(resource);
            });
            resource.addEventListener("error", () => {
                resolve(resource);
            });
        });
    }

}

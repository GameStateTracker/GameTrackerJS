const CONVERTER_FN = [];
let OFFSET = 0;
const NO_UPDATE = new Set();

class SavestateConverter {

    set offset(value) {
        OFFSET = Math.max(parseInt(value) || 0, 0);
    }

    get offset() {
        return OFFSET;
    }

    get version() {
        return OFFSET + CONVERTER_FN.length;
    }

    convert(state) {
        const version = state.version ?? 0;
        if (version < OFFSET) {
            // TODO show error to user and link to converter page
        }
        if (state["data"] == null) {
            state = {data: state};
        }
        const name = state.name || "";
        const timestamp = state.timestamp || new Date();
        const autosave = state.autosave || new Date();
        const notes = state.notes || "";
        if (version < this.version) {
            for (let i = version; i < this.version; ++i) {
                const fn = CONVERTER_FN[i - OFFSET];
                if (typeof fn == "function") {
                    const newState = fn(state);
                    if (newState.data == null) {
                        newState.data = state.data;
                    }
                    if (newState.options == null) {
                        newState.options = state.options;
                    }
                    if (newState.filter == null) {
                        newState.filter = state.filter;
                    }
                    if (newState.startitems == null) {
                        newState.startitems = state.startitems;
                    }
                    state = newState;
                }
                if (!NO_UPDATE.has(i)) {
                    state.version = i;
                }
            }
            state.name = name;
            state.timestamp = timestamp;
            state.autosave = autosave;
            state.notes = notes;
        }
        return state;
    }

    createEmptyState(defaultData = {}, defaultOptions = {}) {
        const res = {
            name: "",
            data: {},
            options: {},
            filter: {},
            notes: "",
            autosave: false,
            timestamp: new Date(),
            version: this.version
        };
        if (typeof defaultData == "object") {
            for (const name in defaultData) {
                res.data[name] = {};
                for (const key in defaultData[name]) {
                    res.data[name][key] = defaultData[name][key];
                }
            }
        }
        if (typeof defaultOptions == "object") {
            for (const key in defaultOptions) {
                res.options[key] = defaultOptions[key];
            }
        }
        return res;
    }

    register(conv, muted = false) {
        if (typeof conv == "function") {
            CONVERTER_FN.push(conv);
        }
        if (muted) {
            NO_UPDATE.add(this.version);
        }
    }

}

export default new SavestateConverter();

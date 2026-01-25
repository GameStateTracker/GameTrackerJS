import DataListSelectEntry from "/emcJS/ui/dataview/datalist/components/DataListSelectEntry.js";
import DateUtil from "/emcJS/util/date/DateUtil.js";
import TPL from "./SavestateEntry.js.html" assert {type: "html"};
import STYLE from "./SavestateEntry.js.css" assert {type: "css"};

export default class SavestateEntry extends DataListSelectEntry {

    #contentEl;

    #autoEl;

    #nameEl;

    #dateEl;

    #versionEl;

    constructor() {
        super();
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#contentEl = this.shadowRoot.getElementById("content");
        this.#contentEl.append(els);
        this.#autoEl = this.shadowRoot.getElementById("auto");
        this.#nameEl = this.shadowRoot.getElementById("name");
        this.#dateEl = this.shadowRoot.getElementById("date");
        this.#versionEl = this.shadowRoot.getElementById("version");
    }

    setData(data) {
        const {
            autosave,
            name,
            timestamp,
            version
        } = data.data;
        this.#autoEl.innerText = autosave === "true" ? "[auto]" : "";
        this.#nameEl.innerText = name;
        this.#dateEl.innerHTML = this.#convertDate(timestamp);
        this.#versionEl.innerHTML = this.#convertVersion(version);
    }

    #convertDate(timestamp) {
        if (timestamp != null) {
            return DateUtil.format(new Date(timestamp), "D.M.Y h:m:s");
        } else {
            return "no date";
        }
    }

    #convertVersion(version) {
        if (version != null) {
            return `(v-${("00" + version).slice(-3)})`;
        } else {
            return "(v-000)";
        }
    }

}

customElements.define("gt-modal-savestate-entry", SavestateEntry);

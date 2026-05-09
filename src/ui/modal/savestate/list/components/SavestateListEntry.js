import DataListSelectEntry from "@emcjs/fe/ui/dataview/datalist/components/DataListSelectEntry.js";
import DateUtil from "@emcjs/core/util/date/DateUtil.js";
import TPL from "./SavestateListEntry.js.html" assert {type: "html"};
import STYLE from "./SavestateListEntry.js.css" assert {type: "css"};

export default class SavestateListEntry extends DataListSelectEntry {

    #contentEl;

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
        } = data;
        this.#nameEl.classList.toggle("autosave", autosave);
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

customElements.define("gt-modal-savestate-list-entry", SavestateListEntry);

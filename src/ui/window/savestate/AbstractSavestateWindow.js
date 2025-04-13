// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import DateUtil from "/emcJS/util/date/DateUtil.js";
import Window from "/emcJS/ui/overlay/window/Window.js";
import "/emcJS/ui/input/ListSelect.js";

import SavestateManager from "../../../savestate/SavestateManager.js";

const TPL = new Template(`
<emc-listselect id="statelist" sort></emc-listselect>
`);

const STYLE = new GlobalStyle(`
#window {
    min-width: min(600px, -50px + 100vw);
}
#footer,
.button {
    display: flex;
}
#footer {
    align-items: center;
    justify-content: flex-end;
    min-height: 50px;
    padding: 5px;
    color: var(--modal-footer-text-color, #000000);
    background-color: var(--modal-footer-back-color, #e4e4e4);
    background-image: var(--modal-footer-back-image, none);
    border-top: solid var(--modal-border-width, 2px) var(--modal-border-color, #cccccc);
}
.button {
    margin-left: 10px;
    padding: 5px;
    color: var(--button-text-color, #000000);
    background-color: var(--button-back-color, #eaeaea);
    border-style: solid;
    border-width: var(--button-border-width, 2px);
    border-color: var(--button-border-color, #222222);
    border-radius: var(--button-border-radius, 6px);
    align-items: center;
    justify-content: center;
    font-weight: 900;
    text-transform: uppercase;
    cursor: pointer;
    user-select: none;
    appearance: none;
}
.button:hover {
    color: var(--button-hover-text-color, #ffffff);
    background-color: var(--button-hover-back-color, #353935);
    border-color: var(--button-hover-border-color, #222222);
}
#statename {
    display: block;
    flex: 1;
    padding: 5px;
}
#statelist {
    height: 40dvh;
    border: solid 2px #ccc;
}
emc-option .name {
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
emc-option .date,
emc-option .version {
    margin-left: 10px;
    font-size: 0.8em;
    opacity: 0.4;
}
emc-option .auto {
    margin-right: 4px;
    opacity: 0.4;
    font-style: italic;
}
`);

export default class AbstractSavestateWindow extends Window {

    constructor(title = "Savestates", options = {}) {
        super(title, options.close);
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        const body = this.shadowRoot.getElementById("body");
        body.innerHTML = "";
        body.append(els);
    }

    async show(activeState) {
        const lst = this.shadowRoot.getElementById("statelist");
        await this.refreshList();
        if (activeState != null && lst.hasValue(activeState)) {
            lst.value = activeState;
        }
        super.show();
    }

    async refreshList() {
        const lst = this.shadowRoot.getElementById("statelist");
        lst.innerHTML = "";
        const states = await SavestateManager.getStates();
        for (const state in states) {
            lst.append(createOption(state, states[state]));
        }
    }

}

function createOption(key, state) {
    const opt = document.createElement("emc-option");
    opt.value = key;
    // autosave
    if (state.autosave) {
        const ato = document.createElement("span");
        ato.className = "auto";
        ato.innerHTML = "[auto]";
        opt.className = "autosave";
        opt.append(ato);
    }
    // name
    const nme = document.createElement("span");
    nme.className = "name";
    nme.innerHTML = state.name;
    opt.append(nme);
    // date
    const dte = document.createElement("span");
    dte.className = "date";
    if (state.timestamp != null) {
        dte.innerHTML = DateUtil.convert(new Date(state.timestamp), "D.M.Y h:m:s");
    } else {
        dte.innerHTML = "no date";
    }
    opt.append(dte);
    // version
    const vrs = document.createElement("span");
    vrs.className = "version";
    if (state.version != null) {
        vrs.innerHTML = `(v-${("00" + state.version).slice(-3)})`;
    } else {
        vrs.innerHTML = "(v-000)";
    }
    opt.append(vrs);
    return opt;
}

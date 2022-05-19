// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import DateUtil from "/emcJS/util/DateUtil.js";
import Window from "/emcJS/ui/overlay/window/Window.js";

import SavestateManager from "../../../savestate/SavestateManager.js";

const TPL = new Template(`
<emc-listselect id="statelist"></emc-listselect>
`);

const STYLE = new GlobalStyle(`
:host,
.footer,
.button {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
}
:host {
    position: absolute !important;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.3);
    align-items: flex-start;
    justify-content: center;
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
    z-index: 1000000;
}
#window {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 1000px;
    margin-top: 100px;
    color: black;
    background-color: white;
    border: solid 2px #cccccc;
    border-radius: 4px;
    resize: both;
}
#header {
    display: flex;
    border-bottom: solid 2px #cccccc;
}
#title {
    display: flex;
    align-items: center;
    flex: 1;
    height: 30px;
    padding: 0 10px;
    font-weight: bold;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 1em;
    line-height: 1em;
}
#body {
    display: block;
    padding: 20px;
    min-height: 10vh;
    max-height: 50vh;
    overflow: auto;
}
:focus {
    box-shadow: 0 0 2px 2px var(--input-focus-color, #06b5ff);
    outline: none;
}
:focus:not(:focus-visible) {
    box-shadow: none;
    outline: none;
}
#close {
    display: flex;
    width: 40px;
    height: 30px;
    border: none;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    -webkit-appearance: none;
    font-size: 1.2em;
    line-height: 1em;
}
#close:hover {
    color: white;
    background-color: red;
}
#close:focus {
    box-shadow: inset red 0 0px 3px 4px;
    outline: none;
}
#close:focus:not(:focus-visible) {
    box-shadow: none;
    outline: none;
}
#footer,
.button {
    display: flex;
}
#footer {
    height: 50px;
    padding: 10px 30px 10px;
    justify-content: flex-end;
    border-top: solid 2px #cccccc;
}
.button {
    margin-left: 10px;
    padding: 5px;
    border: solid 1px black;
    border-radius: 2px;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    -webkit-appearance: none;
}
.button:hover {
    color: white;
    background-color: black;
}
#statename {
    display: block;
    flex: 1;
    padding: 5px;
}
#statelist {
    height: 40vh;
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
        if (activeState != null) {
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

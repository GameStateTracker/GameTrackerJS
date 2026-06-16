// frameworks
import {mix} from "@emcjs/core/mixin/Mixin.js";
import CSSTemplate from "@emcjs/fe/util/template/CSSTemplate.js";
import ContextMenu from "@emcjs/fe/ui/overlay/ctxmenu/ContextMenu.js";
import EventTargetListenerElementMixin from "@emcjs/fe/ui/mixin/EventTargetListenerElementMixin.js";
import ExitStateManager from "../../statemanager/world/exit/ExitStateManager.js";
import EntranceStateManager from "../../statemanager/world/entrance/EntranceStateManager.js";
import Savestate from "../../savestate/Savestate.js";
import EntranceBindingHandler from "../../util/handler/EntranceBindingHandler.js";
import "../entrance/EntranceSelectList.js";

const STORAGES = {exitBindings: Savestate.getStorage("exitBindings")};

const STYLE = new CSSTemplate(`
::slotted(#select) {
    min-height: min(300px, 50dvh);
    max-height: 50dvh;
    min-width: min(300px, 90dvw);
    max-width: 90dvw;
}
`);

const BaseClass = mix(ContextMenu).with(EventTargetListenerElementMixin);

export default class ExitBindingContextMenu extends BaseClass {

    #exitSelectEl;

    constructor() {
        super();
        STYLE.apply(this.shadowRoot);
    }

    initItems() {
        this.#exitSelectEl = document.createElement("gt-entrance-select-list");
        this.#exitSelectEl.id = "select";
        this.#exitSelectEl.addEventListener("cancel", (event) => {
            this.close();
            event.stopPropagation();
            return false;
        });
        this.#exitSelectEl.addEventListener("change", (event) => {
            const ev = new Event("change");
            ev.value = event.value;
            this.dispatchEvent(ev);
        });
        this.#exitSelectEl.addEventListener("click", (event) => {
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
        this.#exitSelectEl.addEventListener("keyup", (event) => {
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
        super.setItems([this.#exitSelectEl]);
    }

    setItems() {
        // nothing
    }

    show(posX, posY, access, current) {
        super.show(posX, posY, access, current);
        this.fillEntranceSelection(access, current).then(() => {
            super.show(posX, posY, access, current);
        });
    }

    close() {
        this.#exitSelectEl.resetSearch();
        super.close();
    }

    initFocus() {
        this.#exitSelectEl.focus();
    }

    async fillEntranceSelection(access, current = "") {
        this.#exitSelectEl.innerHTML = "";
        // retrieve bound
        const bound = new Set();
        for (const [key, value] of STORAGES.exitBindings) {
            if (value != current) {
                const boundExit = EntranceStateManager.get(key);
                if (boundExit == null || boundExit.props.isBiDir) {
                    bound.add(value);
                }
            }
        }
        // add unbind
        const unbindEl = document.createElement("gt-entrance-select-option");
        unbindEl.ref = "";
        unbindEl.value = "";
        unbindEl.style.fontStyle = "italic";
        this.#exitSelectEl.append(unbindEl);
        // add empty
        const emptyEl = document.createElement("gt-entrance-select-option");
        emptyEl.ref = "0";
        emptyEl.value = "0";
        emptyEl.style.fontStyle = "italic";
        this.#exitSelectEl.append(emptyEl);
        // set choices and value
        const exit = ExitStateManager.get(access);
        if (exit != null) {
            // add options
            const allPromEntrances = [];
            for (const [, entrance] of EntranceStateManager) {
                allPromEntrances.push(this.#addEntrance(access, entrance, exit, bound));
            }
            this.#exitSelectEl.value = current;
            await allPromEntrances;
        } else {
            this.#exitSelectEl.value = "";
        }
    }

    #addEntrance(access, entrance, exit, bound) {
        return new Promise((resolve) => {
            if (access != entrance.ref && (exit.props.ignoreBound || !bound.has(entrance.ref))) {
                const isBindable = EntranceBindingHandler.checkBindable(exit, entrance);
                if (isBindable) {
                    const entranceEl = document.createElement("gt-entrance-select-option");
                    entranceEl.ref = entrance.ref;
                    entranceEl.value = entrance.ref;
                    this.#exitSelectEl.append(entranceEl);
                }
            }
            setTimeout(() => {
                resolve();
            }, 0);
        });
    }

}

customElements.define("gt-ctxmenu-exitbinding", ExitBindingContextMenu);

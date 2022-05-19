// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import Panel from "/emcJS/ui/layout/Panel.js";
import SearchAnd from "/emcJS/util/search/SearchAnd.js";
import "/emcJS/ui/input/SearchField.js";
import "/emcJS/ui/input/SearchSelect.js";
import "/emcJS/ui/input/TokenSelect.js";
import "/emcJS/ui/input/InputWrapper.js";

import WorldResource from "../../../resource/WorldResource.js";
import WorldStateManagerRegistry from "../../../statemanager/WorldStateManagerRegistry.js";
import Language from "../../../util/Language.js";
import "./components/ExitChoice.js";

const TPL = new Template(`
<div id="searchbar">
    <div class="search-group">
        <emc-input-search id="search"></emc-input-search>
        <emc-searchselect id="search-mode">
            <emc-option value="both">
                <emc-i18n-label i18n-key="search_mode_both" i18n-value="Exit and bound entrance"></emc-i18n-label>
            </emc-option>
            <emc-option value="access">
                <emc-i18n-label i18n-key="search_mode_value" i18n-value="Exit only"></emc-i18n-label>
            </emc-option>
            <emc-option value="value">
                <emc-i18n-label i18n-key="search_mode_access" i18n-value="Bound entrance only"></emc-i18n-label>
            </emc-option>
        </emc-searchselect>
    </div>
    <div class="search-group">
        <emc-tokenselect id="tokenizer"></emc-tokenselect>
        <label>
            <emc-input-wrapper">
                <input type="checkbox" id="strict" class="settings-input" checked>
            </emc-input-wrapper>
            <emc-i18n-label i18n-key="strict_categories" i18n-value="Strict categories"></emc-i18n-label>
        </label>
    </div>
    <div class="search-group">
        <label>
            <emc-input-wrapper>
                <input type="checkbox" id="unbound" class="settings-input">
            </emc-input-wrapper>
            <emc-i18n-label i18n-key="show_unbound_only" i18n-value="Unbound only"></emc-i18n-label>
        </label>
    </div>
</div>
<div id="scroll-container">
    <slot>
    </slot>
</div>
`);

const STYLE = new GlobalStyle(`
:host {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
}
#searchbar {
    display: flex;
    flex-direction: row;
    flex-shrink: 0;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: flex-start;
    overflow-x: none;
    overflow-y: none;
    border-bottom: solid 2px #cccccc;
}
#searchbar > *:not(.search-group) {
    margin: 5px;
}
.search-group {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    padding: 5px;
}
#search,
#search-mode,
#tokenizer {
    width: 500px;
}
#search,
#tokenizer {
    max-width: calc(100vw - 10px);
    padding: 5px;
    flex: 0 0 0%;
}
label {
    display: flex;
    align-items: center;
}
.settings-input {
    --input-text-color: #ffffff;
    --input-back-color: #000000;
    --input-border-color: #ffffff;
}
#scroll-container {
    flex: 1;
    overflow: auto;
}
::slotted(*) {
    border-bottom: solid 1px var(--list-border-bottom-color, #000000);
    border-top: solid 1px var(--list-border-top-color, #000000);
}
::slotted(.hidden) {
    display: none;
}
`);

const EXITS = WorldResource.get("exit");
const CATEGORIES = new WeakMap();

export default class ExitList extends Panel {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        CATEGORIES.set(this, new Set());
        for (const name in EXITS) {
            const state = WorldStateManagerRegistry.get("exit").get(name);
            this.addEntrance(state);
        }
        /* --- */
        const search = this.shadowRoot.getElementById("search");
        search.addEventListener("change", () => {
            this.calculateItems();
        }, true);
        const searchMode = this.shadowRoot.getElementById("search-mode");
        searchMode.addEventListener("change", () => {
            this.calculateItems();
        }, true);
        const tokenizer = this.shadowRoot.getElementById("tokenizer");
        tokenizer.addEventListener("change", () => {
            this.calculateItems();
        }, true);
        const strict = this.shadowRoot.getElementById("strict");
        strict.addEventListener("change", () => {
            this.calculateItems();
        }, true);
        const unbound = this.shadowRoot.getElementById("unbound");
        unbound.addEventListener("change", () => {
            this.calculateItems();
        }, true);
    }

    calculateItems() {
        const search = this.shadowRoot.getElementById("search");
        const searchMode = this.shadowRoot.getElementById("search-mode");
        const tokenizer = this.shadowRoot.getElementById("tokenizer");
        const unbound = this.shadowRoot.getElementById("unbound");
        const strict = this.shadowRoot.getElementById("strict");
        const actCat = new Set(tokenizer.value);
        for (const el of this.children) {
            if (el) {
                let isVisible = true;
                if (actCat.size > 0) {
                    const elCat = new Set(JSON.parse(el.getAttribute("categories") || "[]"));
                    if (strict.checked) {
                        for (const c of actCat) {
                            if (!elCat.has(c)) {
                                isVisible = false;
                                break;
                            }
                        }
                    } else {
                        isVisible = false;
                        for (const c of elCat) {
                            if (actCat.has(c)) {
                                isVisible = true;
                                break;
                            }
                        }
                    }
                }
                if (isVisible) {
                    if (!el.value || !unbound.checked) {
                        if (search.value) {
                            const mode = searchMode.value;
                            const regEx = new SearchAnd(search.value);
                            const transAccess = Language.translate(`exit[${el.getAttribute("access")}]`);
                            const transValue = Language.translate(`entrance[${el.getAttribute("value")}]`);
                            const transAccessRes = mode != "value" && transAccess.match(regEx);
                            const transValueRes = mode != "access" && transValue.match(regEx);
                            el.classList.toggle("markname", transAccessRes);
                            el.classList.toggle("markvalue", transValueRes);
                            if (transAccessRes || transValueRes) {
                                el.classList.remove("hidden");
                                continue;
                            }
                        } else {
                            el.classList.remove("markname");
                            el.classList.remove("markvalue");
                            el.classList.remove("hidden");
                            continue;
                        }
                    }
                }
                el.classList.remove("markname");
                el.classList.remove("markvalue");
                el.classList.add("hidden");
            }
        }
    }

    addCategory(category) {
        const categories = CATEGORIES.get(this);
        if (!categories.has(category)) {
            categories.add(category);
            const tokenizer = this.shadowRoot.getElementById("tokenizer");
            const el = document.createElement("emc-option");
            el.value = category;
            Language.applyLabel(el, category);
            tokenizer.append(el);
        }
    }

    addEntrance(state) {
        const el = document.createElement("gt-exitchoice");
        el.ref = state.ref;
        el.setAttribute("access", state.props.logicAccess);
        el.setAttribute("type", state.props.type);
        el.setAttribute("categories", JSON.stringify(state.props.categories));
        for (const cat of state.props.categories) {
            this.addCategory(cat);
        }
        el.addEventListener("change", () => {
            this.calculateItems();
        });
        this.append(el);
    }

}

Panel.registerReference("exitlist", ExitList);
customElements.define("gt-exitlist", ExitList);

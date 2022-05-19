// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import CustomElement from "/emcJS/ui/CustomElement.js";
import "/emcJS/ui/i18n/I18nLabel.js";

const TPL = new Template(`
<div id="header">
    <div id="title" class="textarea">
        <emc-i18n-label id="text"></emc-i18n-label>
    </div>
</div>
`);

const STYLE = new GlobalStyle(`
:host {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    width: 100%;
    padding: 3px;
    user-select: none;
}
:host([hidden]:not([hidden="false"])) {
    display: none;
}
#header {
    display: flex;
    flex-direction: column;
    width: 100%;
    cursor: pointer;
}
#header:hover,
:host(.ctx-marked) #header {
    background-color: var(--main-hover-color, #ffffff32);
}
.textarea {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex: 1;
    width: 100%;
    min-height: 35px;
    padding: 2px;
    word-break: break-word;
}
.textarea:empty {
    display: none;
}
.textarea + .textarea {
    margin-top: 5px;
}
#text {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex: 1;
    color: var(--page-text-color, #000000);
}
`);

export default class WorldListEntry extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* mouse events */
        const headerEl = this.shadowRoot.getElementById("header");
        headerEl.addEventListener("click", (event) => {
            this.clickHandler(event);
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
    }

    clickHandler(event) {
        // nothing
    }

    get hidden() {
        return this.getAttribute("hidden") != "false";
    }

    set hidden(val) {
        this.setAttribute("hidden", !!val);
    }

    get textRef() {
        return "";
    }

    get category() {
        return "";
    }

}

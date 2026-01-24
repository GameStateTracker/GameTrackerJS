import SessionStorage from "/emcJS/data/storage/global/SessionStorage.js";
import {uniqueKey} from "/emcJS/util/helper/UniqueGenerator.js";
import Modal from "/emcJS/ui/modal/Modal.js";
import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import "/emcJS/ui/i18n/I18nLabel.js";
import "/emcJS/ui/form/button/Button.js";
import "/emcJS/ui/form/element/input/password/PasswordInput.js";
import "/emcJS/ui/form/element/input/string/StringInput.js";
import "/emcJS/ui/form/element/input/switch/SwitchInput.js";
import ItemViewHost from "../../../../util/rtc/itemview/ItemViewHost.js";
import ParameterStorage from "../../../../storage/ParameterStorage.js";
import VersionData from "../../../../data/VersionData.js";
import TPL from "./RemoteItemViewModal.js.html" assert {type: "html"};
import STYLE from "./RemoteItemViewModal.js.css" assert {type: "css"};

const AUTOCONNECT_TOKEN = "GTJS::RemoteItemView::AutoConnect";
const PARAMETER_TOKEN_KEY = "item_view_modal.token";
const PARAMETER_AUTOCONNECT_KEY = "item_view_modal.autoconnect";

export default class RemoteItemViewModal extends Modal {

    #itemViewHost = new ItemViewHost(window.location.hostname == "localhost" ? 8001 : "");

    #connectionTokenEl;

    #generateTokenEl;

    #viewLinkEl;

    #autoConnectEl;

    #connectEl;

    #disconnectEl;

    constructor() {
        super("Remote Item View");
        this.setIcon({
            type: "font",
            content: "stream",
            style: {
                color: "#1594cb",
                shadow: true
            }
        });
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        const contentEl = this.shadowRoot.getElementById("content");
        const footerEl = this.shadowRoot.getElementById("footer");

        const formEl = els.getElementById("form");
        this.#connectEl = els.getElementById("connect");
        this.#disconnectEl = els.getElementById("disconnect");

        contentEl.append(formEl);
        footerEl.append(this.#connectEl);
        footerEl.append(this.#disconnectEl);

        this.#connectionTokenEl = this.shadowRoot.getElementById("connection-token");
        this.#generateTokenEl = this.shadowRoot.getElementById("generate-token");
        this.#viewLinkEl = this.shadowRoot.getElementById("view-link");
        this.#autoConnectEl = this.shadowRoot.getElementById("auto-connect");

        this.#connectEl.addEventListener("click", () => {
            const connectionToken = this.#connectionTokenEl.value;
            const autoconnect = this.#autoConnectEl.value;
            ParameterStorage.set(PARAMETER_TOKEN_KEY, connectionToken);
            ParameterStorage.set(PARAMETER_AUTOCONNECT_KEY, autoconnect);
            this.#connect(connectionToken);
        });
        this.#disconnectEl.addEventListener("click", () => {
            this.#disconnect();
        });

        this.#connectionTokenEl.addEventListener("change", () => {
            const connectionToken = this.#connectionTokenEl.value;
            const linkUrl = new URL(`/remote/itemview/#${connectionToken}`, location);
            this.#viewLinkEl.value = linkUrl.href;
        });
        this.#generateTokenEl.addEventListener("click", () => {
            const connectionToken = uniqueKey();
            this.#connectionTokenEl.value = connectionToken;
        });
        /* --- */
        if (SessionStorage.has(AUTOCONNECT_TOKEN)) {
            const connectionToken = SessionStorage.get(AUTOCONNECT_TOKEN);
            this.#connect(connectionToken);
        }
    }

    show() {
        const connectionToken = ParameterStorage.get(PARAMETER_TOKEN_KEY);
        const autoconnect = ParameterStorage.get(PARAMETER_AUTOCONNECT_KEY);
        this.#connectionTokenEl.value = connectionToken;
        this.#autoConnectEl.value = autoconnect;
        if (this.#itemViewHost.isHosting()) {
            this.#onConnected();
        } else {
            this.#onDisonnected();
        }
        super.show();
    }

    focusLast() {
        if (this.#itemViewHost.isHosting()) {
            this.#connectEl.focus();
        } else {
            this.#disconnectEl.focus();
        }
    }

    async #connect(connectionToken) {
        try {
            this.#onConnecting();
            const connected = await this.#itemViewHost.host(connectionToken, "", VersionData.version);
            if (connected) {
                if (this.#autoConnectEl.value) {
                    SessionStorage.set(AUTOCONNECT_TOKEN, connectionToken);
                }
                this.#onConnected();
            } else {
                this.#onDisonnected();
            }
        } catch (error) {
            this.#onDisonnected();
            console.error(error);
            ModalDialog.error("Error", "An error occured", [error]);
        }
    }

    async #disconnect() {
        await this.#itemViewHost.close();
        SessionStorage.delete(AUTOCONNECT_TOKEN);
        this.#onDisonnected();
    }

    #onConnecting() {
        this.#connectEl.text = "connecting...";
        this.#connectEl.disabled = true;

        this.#connectionTokenEl.readonly = true;
        this.#generateTokenEl.disabled = true;
        this.#autoConnectEl.disabled = true;
    }

    #onConnected() {
        this.#connectEl.text = "connect";
        this.#connectEl.disabled = false;

        this.#connectionTokenEl.readonly = true;
        this.#generateTokenEl.disabled = true;
        this.#autoConnectEl.disabled = true;

        this.#connectEl.hidden = true;
        this.#disconnectEl.hidden = false;
    }

    #onDisonnected() {
        this.#connectEl.text = "connect";
        this.#connectEl.disabled = false;

        this.#connectionTokenEl.readonly = false;
        this.#generateTokenEl.disabled = false;
        this.#autoConnectEl.disabled = false;

        this.#connectEl.hidden = false;
        this.#disconnectEl.hidden = true;
    }

}

customElements.define("tootr-modal-remote-item-view", RemoteItemViewModal);

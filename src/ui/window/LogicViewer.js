import Dialog from "/emcJS/ui/overlay/window/Dialog.js";
import LogicUIAbstractElement from "/editors/ui/logic/AbstractElement.js";
import LogicResource from "/script/resource/LogicResource.js";

class LogicViewer {

    async show(ref, title = ref) {
        const d = new Dialog({
            title: title,
            submit: "OK"
        });
        d.value = ref;
        const el = document.createElement("div");
        el.style.display = "flex";
        const result = await this.getLogic(ref);
        for (const {logic, parent} of result) {
            if (logic) {
                const c = document.createElement("div");
                c.style.padding = "5px";
                c.style.border = "1px #00000033";
                c.style.borderStyle = "none solid";
                if (parent) {
                    const p = document.createElement("button");
                    p.innerHTML = `From:<br>${parent}`;
                    p.addEventListener("click", () => {
                        d.close();
                        this.show(parent);
                    });
                    c.append(p);
                }
                const l = LogicUIAbstractElement.buildLogic(logic);
                l.readonly = true;
                c.append(l);
                el.append(c);
            }
        }
        d.append(el);
        d.show();
    }

    async getLogic(ref) {
        const data = LogicResource.get();
        return this.extractLogic(ref, data);
    }

    extractLogic(ref, data = {}) {
        const res = [];
        for (const name in data.logic) {
            if (name == ref) {
                res.push({logic: data.logic[name], parent: ""});
            }
        }
        for (const region in data.edges) {
            for (const name in data.edges[region]) {
                if (name == ref) {
                    res.push({logic: data.edges[region][name], parent: region});
                }
            }
        }
        return res;
    }

}

export default new LogicViewer();

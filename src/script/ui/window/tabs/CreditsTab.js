// frameworks
import LocalStorage from "/emcJS/storage/LocalStorage.js";
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";


// Track-OOT
import DeveloperData from "/script/data/DeveloperData.js";

const SUPPORTER_URL = new URL("/patreon", location);
if (location.hostname == "localhost") {
    SUPPORTER_URL.port = 10001;
}

const TPL = new Template(`
<div id="credits">
    <div class="panel">
        <label>
            <span class="title">Dev-Team</span>
            <ul id="team">
            </ul>
        </label>
        <label>
            <span class="title">Contributors</span>
            <ul id="contributor">
            </ul>
        </label>
    </div>
    <div class="panel" id="supporters">
    </div>
</div>
`);

const STYLE = new GlobalStyle(`
#credits {
    height: 400px;
    display: flex;
    color: white;
    overflow: hidden;
}
#credits .panel {
    display: block;
    flex: 1;
    padding: 10px;
    margin: 1px;
    background-color: #282828;
}
#credits ul {
    padding-inline-start: 10px;
}
#credits .title {
    font-size: 1.2em;
    font-weight: bold;
}
#credits .name {
    list-style: none;
    padding: 5px 0;
    font-size: 1.5em;
}
#credits .name.owner {
    color: #cb9c3d;
}
#credits .name.team {
    color: #ffdb00;
}
#credits .name.contributor {
    color: #ff2baa;
}
#credits #supporters .name {
    color: #a8a8a8;
}
`);

function sortNames(a, b) {
    if (a.toLowerCase() < b.toLowerCase()) {
        return -1;
    }
    return 1;
}

function sortTiers([, a], [, b]) {
    if (a.value > b.value) {
        return -1;
    }
    return 1;
}

function createDevEntry(name, type) {
    const el = document.createElement("li");
    el.classList.add("name");
    el.classList.add(type);
    el.innerHTML = name;
    return el;
}

function createSupporterPanel(title, data) {
    if (data != null && Array.isArray(data.names) && data.names.length > 0) {
        const res = document.createElement("label");
        const ttl = document.createElement("span");
        ttl.classList.add("title");
        ttl.innerHTML = title;
        const lst = document.createElement("ul");
        for (const name of new Set(data.names)) {
            const el = document.createElement("li");
            el.classList.add("name");
            el.innerHTML = name;
            el.style.color = data.color || "";
            lst.append(el);
        }
        res.append(ttl);
        res.append(lst);
        return res;
    }
}

async function fillCredits(teamList, contributorList, supporterList) {
    teamList.append(createDevEntry(DeveloperData.owner, "owner"));
    const team = DeveloperData.team.sort(sortNames);
    team.forEach(name => {
        teamList.append(createDevEntry(name, "team"));
    });
    const contributors = DeveloperData.contributors.sort(sortNames);
    contributors.forEach(name => {
        contributorList.append(createDevEntry(name, "contributor"));
    });
    let supporters = LocalStorage.get("supporters", {});
    try {
        const r = await fetch(SUPPORTER_URL);
        if (r.status < 200 || r.status >= 300) {
            throw new Error(`error loading patreon data - status: ${r.status}`);
        }
        supporters = await r.json();
        LocalStorage.set("supporters", supporters);
    } catch(err) {
        console.error(err);
    }
    for (const [key, value] of Object.entries(supporters).sort(sortTiers)) {
        const el = createSupporterPanel(key, value);
        if (el != null) {
            supporterList.append(el);
        }
    }
}

export default class CreditsTab extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const teamList = this.shadowRoot.getElementById("team");
        const contributorList = this.shadowRoot.getElementById("contributor");
        const supporterList = this.shadowRoot.getElementById("supporters");
        fillCredits(teamList, contributorList, supporterList);
    }

}

customElements.define("tootr-credits", CreditsTab);

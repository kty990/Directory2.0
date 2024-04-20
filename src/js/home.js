console.log("Starting home.js");

window.onerror = function (ev, source, line, col, err) {
    window.api.send("error", source, err);
    alert(err);
}

const closeBtn = document.getElementById("close");
const minBtn = document.getElementById("minimize");

const url = document.getElementById("search");
const data = document.getElementById("data");

const backBtn = document.getElementById("bck");
const nxtBtn = document.getElementById("nxt");

backBtn.addEventListener("click", async () => {
    setURL(await window.api.invoke("backstep", url.textContent), false);
    displayURL();
})

nxtBtn.addEventListener("click", async () => {
    setURL(await window.api.invoke("forward", url.textContent), false);
    displayURL();
})

closeBtn.addEventListener("click", () => {
    window.api.send("close");
})

minBtn.addEventListener("click", () => {
    window.api.send("minimize");
})

window.addEventListener("keydown", (e) => {
    if (e.key == "t" && e.ctrlKey) {
        window.api.send("toggle-dev-tools")
    } else if (e.key == "r" && e.ctrlKey) {
        window.api.send("dev-refresh");
    }
})

// --------------------------------------------------------------------------------------------------
// ==================================================================================================
// --------------------------------------------------------------------------------------------------

async function setURL(urlValue, history = true) {
    url.textContent = urlValue;
    if (history) {
        window.api.send("addHistory", url.textContent);
    }
}

function convertSize(bytes) {
    const conversion = {
        'PB': 1000000000000000,
        'TB': 1000000000000,
        'GB': 1000000000,
        'MB': 1000000,
        'KB': 1000
    }
    for (const [key, value] of Object.entries(conversion)) {
        let tmp = bytes / value;
        console.log(key, tmp, tmp.toString(), tmp.toString().indexOf('e'))
        if (tmp.toString().indexOf('e') == -1 && Math.round(parseFloat(tmp)) != 0) {
            return `${Math.round(tmp * 100) / 100} ${key}`
        }
    }
    return `${bytes} B`
}

/**
 * 
 * @param {string} name 
 * @param {number} modified 
 * @param {string} type 
 * @param {number} size 
 * @param {boolean} hidden 
 * @returns {string}
 */
function newEntry(name, modified, type, size, hidden) {
    let div = document.createElement("div");
    div.classList.add('entry');
    let namep = document.createElement("p");
    namep.textContent = name;
    namep.id = 'name';
    let modp = document.createElement("p");
    modp.textContent = modified;
    modp.id = 'modified';
    let extp = document.createElement("p");
    extp.textContent = type;
    extp.id = 'type';
    let sizep = document.createElement("p");
    sizep.textContent = `${convertSize(size)}`;
    sizep.id = 'size';
    let hiddenDiv = document.createElement("div");
    hiddenDiv.id = 'hidden';
    let subhidden = document.createElement("div");
    subhidden.style.backgroundColor = (hidden) ? ' style="background-color: #00cc00;"' : '';
    hiddenDiv.appendChild(subhidden);
    div.appendChild(namep);
    div.appendChild(modp);
    div.appendChild(extp);
    div.appendChild(sizep);
    div.appendChild(hiddenDiv);
    return div;
}

function msToDate(ms) {
    // Convert milliseconds since epoch to Date object
    var date = new Date(ms);

    // Get day, month, and year
    var day = date.getDate();
    var month = date.getMonth() + 1; // Months are zero-based
    var year = date.getFullYear();

    // Format day and month with leading zeros if necessary
    var formattedDay = (day < 10) ? '0' + day : day;
    var formattedMonth = (month < 10) ? '0' + month : month;

    // Construct the DD-MM-YYYY format
    var formattedDate = year + '-' + formattedMonth + '-' + formattedDay;

    return formattedDate;
}

async function displayURL() {
    data.innerHTML = `
    <div id="labels">
            <p>Name</p>
            <p>Last Modified</p>
            <p>Type</p>
            <p>Size</p>
            <p>Hidden</p>
        </div>`
    const files = await window.api.invoke("getFiles", url.textContent);

    let isClicked = '';
    let isClickedElement = null;

    for (const file of files) {
        let t = (file.type == 'Directory') ? 'Folder' : file.path.split(".")[1] || 'FILE';
        let name = file.path.split("\\");
        name = name[name.length - 1].split(".")[0];
        let mod = msToDate(file.mod);
        let size = file.size;
        let hidden = file.hidden;
        const e = newEntry(name, mod, t, size, hidden);
        data.appendChild(e);

        e.addEventListener("click", async () => {
            let shouldAdd = !url.textContent.endsWith("\\");
            const targetURL = url.textContent + `${shouldAdd == true ? '\\' : ''}${e.querySelector("#name").textContent}`;
            if (targetURL != isClicked) {
                if (isClickedElement) {
                    isClickedElement.style.backgroundColor = null;
                }
                isClicked = targetURL;
                isClickedElement = e;
                isClickedElement.style.backgroundColor = "var(--active)";
            } else {
                if (file.type != "Directory") {
                    window.api.send("openFile", file);
                } else {
                    await setURL(targetURL);
                    displayURL();
                }
            }
        })
    }

}

// --------------------------------------------------------------------------------------------------
// ==================================================================================================
// --------------------------------------------------------------------------------------------------

url.addEventListener("keydown", async function (event) {
    if (event.code === 'Enter') {
        event.preventDefault();
        url.blur();
        await setURL(url.textContent);
        displayURL();
    }
});

window.api.on("load", (url) => {
    console.log(`Setting url to: ${url}`);
    setURL(url);
    console.log("Displaying url...")
    displayURL();
})


window.addEventListener("DOMContentLoaded", () => {
    window.api.send("load");
})

// --------------------------------------------------------------------------------------------------
// ==================================================================================================
// --------------------------------------------------------------------------------------------------

const desktop = document.getElementById("desktop");
const downloads = document.getElementById("downloads");
const docs = document.getElementById('documents');
const music = document.getElementById("music");

desktop.addEventListener("click", async () => {
    let user = await window.api.invoke("getUser");
    setURL(`C:\\Users\\${user}\\OneDrive\\Desktop`);
    displayURL();
})

downloads.addEventListener("click", async () => {
    let user = await window.api.invoke("getUser");
    setURL(`C:\\Users\\${user}\\Downloads`);
    displayURL();
})

docs.addEventListener("click", async () => {
    let user = await window.api.invoke("getUser");
    setURL(`C:\\Users\\${user}\\OneDrive\\Documents`);
    displayURL();
})

music.addEventListener("click", async () => {
    let user = await window.api.invoke("getUser");
    setURL(`C:\\Users\\${user}\\OneDrive\\Music`);
    displayURL();
})

/**
 * Note for later: Add check box for 'OneDrive'
 */
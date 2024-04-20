const terminal = document.getElementById("terminal");
const output = terminal.querySelector("#output");
const cline = terminal.querySelector("#cline");

async function runCommand() {
    let cmd = cline.value;
    let splitString = cmd.split(" ");
    cline.value = "";
    if (cmd.length > 0) {
        // Attempt to run command
        let result = await window.api.invoke("runCommand", splitString);
        if (result[0] == true) {
            // SHow result in console
            if (result.length > 1) {
                output.innerHTML += `<p class="result">
                ${result[1]}
            </p>`
            } else {
                output.innerHTML += `<p class="result">
                Succesfully ran <span style="color:var(--active);">${cmd}</span>
            </p>`
            }
        } else {
            // Show error in console
            output.innerHTML += `<p class="error">
                ${result[1]}
            </p>`
        }
    } else {
        // Invalid attempt, show error in console
        output.innerHTML += `<p class="error">
                Unable to find command "${splitString[0]}"
            </p>`
    }
}

cline.addEventListener("keydown", async (event) => {
    if (event.key == "Enter") {
        await runCommand();
    }
})

window.api.on("output_download", obj => {
    // ('Video Title:', info.videoDetails.title);
    // console.log('Video Author:', info.videoDetails.author.name);
    // console.log('Video Description:', info.videoDetails.description);
    output.innerHTML += `<p class="result">
                ${obj.title}<br>${obj.author.name}<br>${obj.description}
            </p>`
})

window.api.on("displayOutput", str => {
    output.innerHTML += `<p class="result">
                ${str}
            </p>`
})

window.api.on("clearOutput", () => {
    setTimeout(() => {
        output.innerHTML = "";
    }, 100);
})
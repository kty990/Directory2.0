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
            output.innerHTML += `<p class="result">
                Succesfully ran ${splitString.join(" ")}
            </p>`
        } else {
            // Show error in console
            output.innerHTML += `<p class="result">
                Error: ${result[1]}
            </p>`
        }
    } else {
        // Invalid attempt, show error in console
        output.innerHTML += `<p class="result">
                Unable to find command "${splitString[0]}"
            </p>`
    }
}

cline.addEventListener("keydown", async (event) => {
    if (event.key == "Enter") {
        await runCommand();
    }
})
const input = document.querySelector("#pathSelector input");
const btn_install = document.getElementById("btn-install");
const btn_buscar = document.getElementById("btn-searchDir");
const twitchLink = document.getElementById("twitchLink");
btn_install.addEventListener("click", install)
btn_buscar.addEventListener("click", searchDir)
twitchLink.addEventListener("click", redirect)

function install(){
    console.log("installing ... ")
    window.api.install(input.value)
}

async function searchDir(){
    console.log("buscando")
    result = await window.api.searchDir(input.value)
    canceled = result[0]
    path = result[1]
    if (!canceled){
        input.value = path
    }
}

function redirect(){
    console.log("redirection to twitch")
    window.api.redirectToTwitch()
}
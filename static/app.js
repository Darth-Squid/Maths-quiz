if(!window.console) window.console = {log: function(){}};

let userName = ""

async function api(route, data = {}) {
    const res = await fetch(route, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    });
    return res.json();
}

let loginMenuOpen = false
let createAccountMenu = false

function open_login(){
    let open_login_menu = document.getElementById("login-menu")
    open_login_menu.classList.remove("hidden")

    document.getElementById("login-buttons").classList.add("hidden")
    document.getElementById("welcome-text").classList.add("hidden")
    loginMenuOpen = true
}

async function attempt_login(){
    userName = document.getElementById("username").value
    let password = document.getElementById("password").value

    if (userName === "" && password === ""){
        return
    }

    const res = await api("/login", {"username":userName, "password":password})

    if (res["error"]){
        console.warn(res["error"])
    }

    if (res["success"] === "true"){
        login_success()
        loginMenuOpen = false
    }
    else{
        console.log("Something went wrong")
        document.getElementById("login-error").classList.remove("hidden")
        document.getElementById("login-menu-text").classList.add("hidden")
    }
    
}

function login_success(){
    console.log("LOGIN SUCCESS")
    document.getElementById("login-menu").classList.add("hidden")
    document.getElementById("front-page-icon-container").classList.add("hidden")
    document.getElementById("dashboard").classList.remove("hidden")
    open_dashboard()
}

async function create_account(){
    let userName = document.getElementById("new-username").value
    let password = document.getElementById("new-password").value

    if (userName === "" && password === ""){
        return
    }

    const res = await api("/create_account", {"username":userName, "password":password})

    if (res["error"]){
        console.warn(res["error"])
        document.getElementById("create-account-error").classList.remove("hidden")
        document.getElementById("create-account-menu-text").classList.add("hidden")
        console.log("WOW")
    }

    if (res["success"] === "true"){
        create_account_success()
        createAccountMenu = false
    }
}

function open_create_account(){
    createAccountMenu = true
    let open_create_account_menu = document.getElementById("create-account-menu")
    open_create_account_menu.classList.remove("hidden")

    document.getElementById("login-buttons").classList.add("hidden")
    document.getElementById("welcome-text").classList.add("hidden")
}

function create_account_success(){
    console.log("CREATE ACCOUNT SUCCESS")
    document.getElementById("create-account-menu").classList.add("hidden")
    document.getElementById("front-page-icon-container").classList.add("hidden")
    document.getElementById("dashboard").classList.remove("hidden")
    open_dashboard()
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter'){
        if (loginMenuOpen){
        attempt_login()
        }
        else if (createAccountMenu){
            create_account()
        }

        console.log("Enter key entered")
    }
})

async function open_dashboard() {
    console.log("USER:", userName);

    if (!userName) {
        console.error("No username set!");
        return;
    }

    const nickname = await api("/get_nickname", { username: userName });
    document.getElementById("user-username").textContent = nickname.nickname;

    const iconRes = await api("/get_icon", { username: userName });


    const avatar = document.querySelector(".profile-wrapper");

    if (avatar && iconRes.icon) {
        avatar.style.backgroundImage = `url("/${iconRes.icon}?t=${Date.now()}")`;
        avatar.style.backgroundSize = "cover";
        avatar.style.backgroundPosition = "center";
        avatar.style.backgroundRepeat = "no-repeat";
    }
    console.log("ICON RESPONSE:", iconRes);
    console.log("ICON PATH:", iconRes.icon);
}

function open_profile_picture_changer() {
    document.getElementById("upload-profile-picture").classList.remove("hidden");
}

const dropZone = document.getElementById("open-profile-picture-content");

dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", async (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Only images allowed");
        return;
    }

    const buffer = await file.arrayBuffer();

    const res = await fetch("/upload", {
        method: "POST",
        headers: {
            "Content-Type": "application/octet-stream",
            "X-Filename": "images/" + file.name
        },
        body: buffer
    });

    const data = await res.json();
    console.log("UPLOAD RESPONSE:", data);
    console.log("TRY IMAGE:", "/" + data.path);

    if (data.status === "uploaded") {
        const path = data.path;

        const avatar = document.querySelector(".profile-wrapper");

        if (avatar) {
            avatar.style.backgroundImage = `url("/${path}?t=${Date.now()}")`;
            avatar.style.backgroundSize = "cover";
            avatar.style.backgroundPosition = "center";
            avatar.style.backgroundRepeat = "no-repeat";
        }

        await api("/set_icon", {
            username: userName,
            icon: path
        });
    }

    const test = new Image();
    test.src = "/" + data.path;

    test.onload = () => console.log("IMAGE LOADS");
    test.onerror = () => console.log("IMAGE FAILS:", test.src);
});

function close_profile_picture_changer(){
    document.getElementById("upload-profile-picture").classList.add("hidden")
}

function start_quiz(){
    let active_quizzes = []

    if (document.getElementById("multiplication-quiz-checkbox").value){
        active_quizzes["multiplication"] = true
    }

    if (document.getElementById("division-quiz-checkbox").value){
        active_quizzes["division"] = true
    }

    if (document.getElementById("addition-quiz-checkbox").value){
        active_quizzes["addition"] = true
    }

    if (document.getElementById("subtraction-quiz-checkbox").value){
        active_quizzes["subtraction"] = true
    }

    console.log(active_quizzes)
}
if(!window.console) window.console = {log: function(){}};

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
    let userName = document.getElementById("username").value
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
    document.getElementById("login-buttons").classList.add("hidden")
}

function create_account_success(){
    console.log("CREATE ACCOUNT SUCCESS")
    document.getElementById("create-account-menu").classList.add("hidden")
    document.getElementById("front-page-icon-container").classList.add("hidden")
    document.getElementById("dashboard").classList.remove("hidden")
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
async function api(route, data = {}) {
    const res = await fetch(route, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    });
    return res.json();
}

function open_login(){
    let open_login_menu = document.getElementById("login-menu")
    open_login_menu.classList.remove("hidden")

    document.getElementById("login-buttons").classList.add("hidden")
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
    }
    else{
        console.log("Something went wrong")
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
    }

    if (res["success"] === "true"){
        create_account_success()
    }
}

function open_create_account(){
    let open_create_account_menu = document.getElementById("create-account-menu")
    open_create_account_menu.classList.remove("hidden")

    document.getElementById("login-buttons").classList.add("hidden")
}

function create_account_success(){
    console.log("CREATE ACCOUNT SUCCESS")
    document.getElementById("create-account-menu").classList.add("hidden")
    document.getElementById("front-page-icon-container").classList.add("hidden")
    document.getElementById("dashboard").classList.remove("hidden")
}
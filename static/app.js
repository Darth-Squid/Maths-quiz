if(!window.console) window.console = {log: function(){}};

const USERNAME = ""
const PASSWORD = ""
const FORM = ""

let highScore = 0
let score = 0

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
    document.getElementById("opening-screen").classList.add("hidden")
    document.getElementById("login-menu").classList.add("hidden")
    document.getElementById("front-page-icon-container").classList.add("hidden")
    document.getElementById("dashboard").classList.remove("hidden")
    open_dashboard()
}

async function create_account(){
    userName = document.getElementById("new-username").value
    let password = document.getElementById("new-password").value
    form = document.getElementById("form-list-create-account").value

    if (userName === "" || password === "" || form === "" || form === "null"){
        return
    }

    const res = await api("/create_account", {"username":userName, "password":password, "form": form})

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
    document.getElementById("opening-screen").classList.add("hidden")
    document.getElementById("create-account-menu").classList.add("hidden")
    document.getElementById("front-page-icon-container").classList.add("hidden")
    document.getElementById("dashboard").classList.remove("hidden")

    document.getElementById("quiz-rules").classList.remove("hidden")
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

    let highscore = await api("/get_highscore", {username: userName});
    highScore = highscore["highscore"];
    document.getElementById("highscore").textContent = "Highscore: " + highScore;

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

let totalQuizzes = {}
let currentQuizId = 0
let answers = []
let streak = 0

async function start_quiz(){
    document.getElementById("division-choices").classList.add("hidden");
    document.getElementById("multiplication-choices").classList.add("hidden");

    let active_quizzes = {"multiplication": false, "division": false, "addition": false, "subtraction": false}

    if (document.getElementById("multiplication-quiz-checkbox").checked === true){
        active_quizzes["multiplication"] = true
    }

    if (document.getElementById("division-quiz-checkbox").checked === true){
        active_quizzes["division"] = true
    }

    if (document.getElementById("addition-quiz-checkbox").checked === true){
        active_quizzes["addition"] = true
    }

    if (document.getElementById("subtraction-quiz-checkbox").checked === true){
        active_quizzes["subtraction"] = true
    }

    if (active_quizzes["subtraction"] === false && active_quizzes["multiplication"] === false && active_quizzes["division"] === false && active_quizzes["addition"] === false){
        return
    }

    let multiplication_times_tables = {1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: true, 9: true, 10: true, 11: true, 12: true}
    let division_times_tables = {1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: true, 9: true, 10: true, 11: true, 12: true}

    let multiplication_choice_container = document.getElementById("multiplication-choices")
    let multiplication_1 = document.getElementById("multiplication-choice-1").checked
    let multiplication_2 = document.getElementById("multiplication-choice-2").checked
    let multiplication_3 = document.getElementById("multiplication-choice-3").checked
    let multiplication_4 = document.getElementById("multiplication-choice-4").checked
    let multiplication_5 = document.getElementById("multiplication-choice-5").checked
    let multiplication_6 = document.getElementById("multiplication-choice-6").checked
    let multiplication_7 = document.getElementById("multiplication-choice-7").checked
    let multiplication_8 = document.getElementById("multiplication-choice-8").checked
    let multiplication_9 = document.getElementById("multiplication-choice-9").checked
    let multiplication_10 = document.getElementById("multiplication-choice-10").checked
    let multiplication_11 = document.getElementById("multiplication-choice-11").checked
    let multiplication_12 = document.getElementById("multiplication-choice-12").checked

    multiplication_times_tables[1] = multiplication_1
    multiplication_times_tables[2] = multiplication_2
    multiplication_times_tables[3] = multiplication_3
    multiplication_times_tables[4] = multiplication_4
    multiplication_times_tables[5] = multiplication_5
    multiplication_times_tables[6] = multiplication_6
    multiplication_times_tables[7] = multiplication_7
    multiplication_times_tables[8] = multiplication_8
    multiplication_times_tables[9] = multiplication_9
    multiplication_times_tables[10] = multiplication_10
    multiplication_times_tables[11] = multiplication_11
    multiplication_times_tables[12] = multiplication_12


    let division_choice_container = document.getElementById("multiplication-choices")
    let division_1 = document.getElementById("division-choice-1").checked
    let division_2 = document.getElementById("division-choice-2").checked
    let division_3 = document.getElementById("division-choice-3").checked
    let division_4 = document.getElementById("division-choice-4").checked
    let division_5 = document.getElementById("division-choice-5").checked
    let division_6 = document.getElementById("division-choice-6").checked
    let division_7 = document.getElementById("division-choice-7").checked
    let division_8 = document.getElementById("division-choice-8").checked
    let division_9 = document.getElementById("division-choice-9").checked
    let division_10 = document.getElementById("division-choice-10").checked
    let division_11 = document.getElementById("division-choice-11").checked
    let division_12 = document.getElementById("division-choice-12").checked

    division_times_tables[1] = division_1
    division_times_tables[2] = division_2
    division_times_tables[3] = division_3
    division_times_tables[4] = division_4
    division_times_tables[5] = division_5
    division_times_tables[6] = division_6
    division_times_tables[7] = division_7
    division_times_tables[8] = division_8
    division_times_tables[9] = division_9
    division_times_tables[10] = division_10
    division_times_tables[11] = division_11
    division_times_tables[12] = division_12

    document.getElementById("dashboard").classList.add("hidden")
    document.getElementById("quiz-menu").classList.remove("hidden")


    let multiplyingQuantity = (document.getElementById("multiplication-question-counter").value + 0) /10;
    let divisionQuantity = (document.getElementById("division-question-counter").value + 0) / 10;
    let subtractionQuantity = (document.getElementById("subtraction-question-counter").value + 0) / 10;
    let additionQuantity = (document.getElementById("addition-question-counter").value + 0) / 10;

    console.log(multiplyingQuantity + " " + divisionQuantity + " " + subtractionQuantity + " " + additionQuantity)
    currentQuizId = 0
    totalQuizzes = await api("/generate_quiz", {quizzes: active_quizzes, quantities: {multiplication: multiplyingQuantity, division: divisionQuantity, addition: additionQuantity, subtraction: subtractionQuantity}, multiplication_times_tables: multiplication_times_tables, division_times_tables: division_times_tables})

    answers = totalQuizzes["answers"]

    let quizMenu = document.getElementById("quiz-menu")
    quizMenu.innerHTML = '<iframe src="quiz_pages/1.html" class="quiz-frame" id="quiz-frame"> </iframe>';

    totalQuizzes["files"].sort((a, b) => {
        const numA = Number(a.split(".")[0]);
        const numB = Number(b.split(".")[0]);
        return numA - numB;
    });
    console.log(totalQuizzes["files"])

    console.log(active_quizzes)
    console.log(totalQuizzes)

    score = 0
}

async function next_slide() {
    currentQuizId += 1;

    console.log(totalQuizzes["files"])
    if (currentQuizId >= totalQuizzes["files"].length) {
        console.log("Oooh:" + highScore);
        await api("/set_highscore", {username: userName, new_score: highScore});
        open_dashboard();
        open_leaderboard();
        document.getElementById("dashboard").classList.remove("hidden");
        document.getElementById("quiz-menu").classList.add("hidden");

        let leaderboard = get_leaderboard()
        
    }

    document.getElementById("quiz-frame").src = "quiz_pages/" + totalQuizzes["files"][currentQuizId];
    console.log(totalQuizzes["files"][currentQuizId]);
    const iframe = document.getElementById("quiz-frame");

    iframe.onload = () => {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.getElementById("score-display").textContent = "Score: " + score;
    };
}

async function check_answer(answer){
    if (answers[currentQuizId] == answer){
        score += 1;
        streak += 1;
        if (score > highScore){
            highScore = score;
        }

    }

    else{
        streak = 0;
    }
    await next_slide();
}

function close_rules(){
    document.getElementById("quiz-rules").classList.add("hidden");
}

const chosen_multiplication = [];

function upload_new_multiplication(){
    let container = document.getElementById("multiplication-choices");
    let text = document.getElementById("choose-times-tables-text-multiplication");

    if (container.classList.contains("hidden")){
        container.classList.remove("hidden");
        text.textContent = "Choose times tables ▶";
    }
    else{
        container.classList.add("hidden")
        text.textContent = "Choose times tables ▼";
    }
}

function upload_new_division(){
    let container = document.getElementById("division-choices");
    let text = document.getElementById("choose-times-tables-text-division");

    if (container.classList.contains("hidden")){
        container.classList.remove("hidden");
        text.textContent = "Choose times tables ▶";
    }
    else{
        container.classList.add("hidden");
        text.textContent = "Choose times tables ▼";
    }
}

function hide_self(self){
    document.getElementById(self).classList.add("hidden");

    return void{};
}

async function get_leaderboard(){
    return await api(
        "/get_leaderboard"
    );
}

async function open_leaderboard() {
    const content = document.getElementById("leaderboard-content");
    content.innerHTML = "";

    let leaderboard = await get_leaderboard();
    leaderboard = leaderboard["leaderboard"];

    const leaderboardElement = document.getElementById("leaderboard");

    leaderboard = Object.entries(leaderboard)
    .sort((a, b) => b[1] - a[1]);

    for (const [index, [player, score]] of leaderboard.entries()) {

        let new_entry = document.createElement("div");
        new_entry.className = "leaderboard-entry";

        let rankText = document.createElement("span");
        rankText.className = "leaderboard-rank";
        rankText.textContent = "#" + (index + 1);

        let leaderboard_picture = document.createElement("div");
        leaderboard_picture.className = "profile-wrapper";

        const iconRes = await api("/get_icon", { username: player });

        if (iconRes.icon) {
            leaderboard_picture.style.backgroundImage =
                `url("/${iconRes.icon}?t=${Date.now()}")`;
        }

        const name = await api("/get_nickname", { username: player });

        let nameText = document.createElement("span");
        nameText.className = "leaderboard-username";
        nameText.textContent = name["nickname"];

        let scoreText = document.createElement("span");
        scoreText.className = "leaderboard-score";
        scoreText.textContent = score;

        new_entry.append(
            rankText,
            leaderboard_picture,
            nameText,
            scoreText
        );

        document.getElementById("leaderboard-content").appendChild(new_entry);
    }

    leaderboardElement.classList.remove("hidden");
}

function close_leaderboard() {
    document.getElementById("leaderboard").classList.add("hidden");
}
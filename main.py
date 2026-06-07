import http.server
import os
import random
import string
import webbrowser
from shlex import join
from os.path import isfile, join

from config import PORT
import json
#Default address is: localhost:7000

process = None
console_buffer = []

class IDEHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory="static", **kwargs)

    def _send(self, data, code=200):
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def do_POST(self):
        print("POST PATH:", self.path)

        if self.path == "/upload":
            length = int(self.headers.get("Content-Length", 0))
            data = self.rfile.read(length)
            return self.upload_file(data)

        try:
            length = int(self.headers.get("Content-Length", 0))
            data = json.loads(self.rfile.read(length))
        except Exception as e:
            print("JSON ERROR:", e)
            self._send({"error": "invalid json"}, 400)
            return

        if self.path == "/login":
            print("Login attempt stage 1")
            u = data["username"]
            p = data["password"]

            password = self.hash_string(p)
            return self.login(u, password)

        elif self.path == "/create_account":
            u = data["username"]
            p = data["password"]
            password = self.hash_string(p)

            return self.create_account(u, password, self.generate_16_chars(), data["form"])

        elif self.path == "/get_nickname":
            return self.get_nickname(data["username"])

        elif self.path == "/get_icon":
            return self.get_icon(data)

        elif self.path == "/set_icon":

            username = data["username"]

            icon = data["icon"]

            return self.set_icon(username, icon)

        elif self.path == "/generate_quiz":
            return self.generate_quiz(data)

        elif self.path == "/get_highscore":
            return self.get_highscore(data["username"])

        elif self.path == "/set_highscore":
            return self.set_highscore(data["username"], data["new_score"])

        else:
            return self._send({"error": "invalid api call"}, 400)

    def set_highscore(self, username, new_score):
        with open("users.json", "r+") as file:
            users = json.load(file)
            users[username]["highscore"] = new_score
            file.seek(0)
            json.dump(users, file, indent=4)
            file.truncate()
            return self._send({"success": "true"})

    def get_highscore(self, username):
        with open("users.json", "r+") as file:
            users = json.load(file)
            return self._send({"highscore": users[username]["highscore"]})

    def generate_quiz(self, data):
        for i in os.listdir("static/quiz_pages"):
            if i.endswith(".html"):
                os.remove("static/quiz_pages/" + i)

        questions = []
        for i in range(1, 11):
            if data["multiplication"]:
                  question = f"{random.randrange(1, 12)} * {random.randrange(1, 12)}"
                  questions.append(question)
            if data["division"]:
                question = f"{random.randrange(1, 12)} / {random.randrange(1, 12)}"
                questions.append(question)
            if data["addition"]:
                question = f"{random.randrange(1, 12)} + {random.randrange(1, 12)}"
                questions.append(question)
            if data["subtraction"]:
                question = f"{random.randrange(1, 12)} - {random.randrange(1, 12)}"
                questions.append(question)

        for question in questions:
            with open(f"static/quiz_pages/{questions.index(question) + 1}.html", "w") as file:
                file.write(f"""<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Title</title><link rel="stylesheet" href="quiz_stylesheet.css"></head><body><div id="quiz-screen"><div id="quiz-container"><div id="quiz-top-bar"><div id="question-counter">Question {questions.index(question) + 1} / {len(questions)}</div><div id="score-display">Score: 0</div></div><div id="quiz-content"><div id="quiz-image-container"><img id="quiz-image" src="images/example.png" alt="Question image"></div><div id="quiz-question">What is {question}?</div><input type="text" id="quiz-answer" placeholder="Type your answer..."><button id="submit-answer-button" onclick="parent.check_answer(document.getElementById('quiz-answer').value)">Submit Answer</button></div></div></div></body></html>""")

        return self._send({"files":[i for i in os.listdir("static/quiz_pages") if i.endswith(".html")]})

    def set_icon(self, username, icon):
        with open("users.json", "r+", encoding="utf-8") as file:
            users = json.load(file)

            if username not in users:
                return self._send({"error": "user not found"}, 404)

            users[username]["icon"] = icon

            file.seek(0)
            json.dump(users, file, indent=4)
            file.truncate()

        return self._send({"success": "true"})

    def get_icon(self, data):
        try:
            username = data.get("username")
            if not username:
                return self._send({"error": "missing username"}, 400)

            with open("users.json", "r", encoding="utf-8") as file:
                users = json.load(file)

            if username not in users:
                return self._send({"error": "user not found"}, 404)

            return self._send({
                "icon": users[username]["icon"]
            })

        except Exception as e:
            print("get_icon error:", e)
            return self._send({"error": "server error"}, 500)

    def get_nickname(self, currentUser):
        with open("users.json", "r") as file:
            users = json.load(file)

        if currentUser not in users:
            return self._send({"error": "not found"}, 404)

        return self._send({
            "nickname": users[currentUser]["nickname"]
        })

    def create_account(self, username, password, salt, form):
        with open("users.json", "r+", encoding="utf-8") as file:
            users = json.load(file)

            if username in users:
                return self._send({"error": "already_exists"}, 400)

            users[username] = {
                "password": password + salt,
                "icon": "images/default.png",
                "nickname": username,
                "salt": salt,
                "highscore": 0,
                "max_streak": 0,
                "form": form
            }

            file.seek(0)
            json.dump(users, file, indent=4)
            file.truncate()

        self._send({"success": "true"})


    def login(self, username, password):
        with open("users.json", "r") as file:
            users = json.load(file)
            if username not in users:
                self._send({"error": "Username not found"}, 400)
                return
            if users[username]["password"] == password + users[username]["salt"]:
                self._send({"success": "true"})
            else:
                self._send({"success": "false"})

    def upload_file(self, data):
        filename = self.headers.get("X-Filename")

        if not filename:
            return self._send({"error": "missing filename"}, 400)

        save_path = os.path.join("static", filename)
        os.makedirs(os.path.dirname(save_path), exist_ok=True)

        with open(save_path, "wb") as f:
            f.write(data)

        return self._send({
            "status": "uploaded",
            "path": filename
        })

    def hash_string(self, text):
        result = 0x811c9dc5

        for char in text:
            result ^= ord(char)
            result *= 0x01000193
            result &= 0xFFFFFFFF

        return str(hex(result)[2:])

    def generate_16_chars(self):
        letters = string.ascii_letters + string.digits + string.punctuation + string.whitespace

        value = [random.choice(letters) for i in range(16)]
        valueAsString = ""
        for i in value:
            valueAsString += i

        return valueAsString

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


if __name__ == "__main__":
    webbrowser.open(f'http://localhost:{PORT}')

    http.server.ThreadingHTTPServer(
        ("localhost", PORT),
        IDEHandler
    ).serve_forever()
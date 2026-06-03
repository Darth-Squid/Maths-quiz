import http.server
import random
import string
import webbrowser
from shlex import join

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

        try:
            length = int(self.headers.get("Content-Length", 0))
            data = json.loads(self.rfile.read(length))
        except:
            self.send_response(400)
            self.end_headers()
            return

        if self.path == "/login":
            print("Login attempt stage 1")
            u = data["username"]
            p = data["password"]

            password = self.hash_string(p)

            return self.login(u, password)

        if self.path == "/create_account":
            u = data["username"]
            p = data["password"]

            password = self.hash_string(p)

            return self.create_account(u, password, self.generate_16_chars())


    def create_account(self, username, password, salt):
        with open("users.json", "r+", encoding="utf-8") as file:
            users = json.load(file)

            if username in users:
                return self._send({"error": "already_exists"}, 400)

            users[username] = {
                "password": password + salt,
                "icon": "images/default.png",
                "nickname": username,
                "salt": salt,
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

        return join(value)

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
import http.server
import webbrowser
from config import PORT
import json
#Default address is: localhost:8000

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
            return self.login(u, p)

        if self.path == "/create_account":
            u = data["username"]
            p = data["password"]
            return  self.create_account(u, p)

    def create_account(self, username, password):
        with open("users.json", "r+", encoding="utf-8") as file:
            users = json.load(file)

            if username in users:
                return self._send({"error": "already_exists"}, 400)

            users[username] = {
                "password": password,
                "icon": "images/default.png",
                "nickname": username
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
            if users[username]["password"] == password:
                self._send({"success": "true"})
            else:
                self._send({"success": "false"})

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


if __name__ == "__main__":
    webbrowser.open('http://localhost:7000')
    http.server.HTTPServer(("localhost", PORT), IDEHandler).serve_forever()
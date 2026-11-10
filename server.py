#!/usr/bin/env python3
"""Static server that returns the Stylex 404 page for unknown addresses."""

import os
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))


class Handler(SimpleHTTPRequestHandler):
    def send_error(self, code, message=None, explain=None):
        fallback = os.path.join(self.directory or ROOT, "404.html")
        if code == 404 and os.path.isfile(fallback):
            with open(fallback, "rb") as handle:
                body = handle.read()
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-cache")
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(body)
            return
        super().send_error(code, message, explain)


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", 4173), partial(Handler, directory=ROOT))
    print("Serving Stylex on http://127.0.0.1:4173", flush=True)
    server.serve_forever()

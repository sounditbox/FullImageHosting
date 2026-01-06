import http.server
import logging


class CustomRequestHandler(http.server.BaseHTTPRequestHandler):
    def _set_response(self, status_code=200):
        self.send_response(status_code)
        self.send_header('Content-type', 'text/html')
        self.end_headers()

    def do_GET(self):
        logging.info(f'GET {self.path}')
        self.send_header('Content-type', 'text/html')
        self.wfile.write('Hello, World!'.encode())

    def do_POST(self):
        pass


def run_server():
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    server_address = ("0.0.0.0", 8000)
    httpd = http.server.HTTPServer(server_address, CustomRequestHandler)
    logging.info(f'Starting httpd server on {server_address}...\n')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()
    logging.info('Stopping httpd server.\n')


if __name__ == "__main__":
    run_server()

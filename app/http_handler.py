import http
import json
import logging
import urllib

from database import (get_images_metadata,
                      get_image_metadata,
                      delete_metadata)

logger = logging.getLogger(__name__)


class RequestHandler(http.server.BaseHTTPRequestHandler):
    server_version = "ImageHost/0.1"

    def do_GET(self):
        """Handle GET requests."""
        parsed_path = urllib.parse.urlparse(self.path)
        logger.info(f"GET request, path = {parsed_path}")

        if parsed_path.path == "/images/":
            self.send_json(get_images_metadata())
        elif parsed_path.path.startswith("/images/"):
            image_id = parsed_path.path.split("/")[2]
            if not image_id.isdigit():
                self.send_json({"error": "Invalid image ID"}, 404)
            try:
                data = get_image_metadata(image_id)
                self.send_json(data)
            except Exception as e:
                self.send_json({"error": str(e)}, 404)
        else:
            self.send_json({"error": "Not found"}, 404)

    def do_POST(self):
        """Handle POST requests."""
        # content_length = int(self.headers['Content-Length'])  # Get the size of data
        # post_data = self.rfile.read(content_length)  # Get the data itself
        # try:
        #     data = json.loads(post_data)
        #     response_message = f"Received POST data: {data}"
        # except json.JSONDecodeError:
        #     response_message = f"Received raw POST data: {post_data.decode('utf-8')}"
        #
        # self.send_response(200)
        # self.send_header("Content-type", "application/json")
        # self.end_headers()
        # response = {"status": "success", "message": response_message}
        # self.wfile.write(json.dumps(response).encode("utf-8"))
        pass

    def do_DELETE(self):
        """Handle DELETE requests."""
        parsed_path = urllib.parse.urlparse(self.path)
        logger.info(f"DELETE request, path = {parsed_path.path}")

        if self.path.startswith("/images/"):
            image_id = parsed_path.path.split("/")[2]
            if not image_id.isdigit():
                self.send_json({"error": "Invalid image ID"}, 404)
            try:
                delete_metadata(image_id)
                self.send_json({}, 204)
            except Exception as e:
                self.send_json({"error": str(e)}, 404)
        else:
            self.send_json({"error": "Not found"}, 404)

    def send_json(self, data: dict | list, status_code: int = 200):
        """Send JSON response."""
        logger.info(f"Sending JSON response: {data}")
        self.send_response(status_code)
        self.send_header("Content-type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

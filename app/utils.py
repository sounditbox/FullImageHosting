import logging
import uuid

from config import MAX_FILE_SIZE, FILE_EXTENSIONS, IMAGE_DIR

logger = logging.getLogger(__name__)


def save_file(filename: str, post_data: bytes):
    with open(f'./{IMAGE_DIR}/{filename}', 'wb') as f:
        f.write(post_data)


def delete_file(filename):
    file_path = f'./{IMAGE_DIR}/{filename}'
    if os.path.exists(file_path):
        os.remove(file_path)
        logger.info(f"File '{file_path}' has been deleted.")
    else:
        logger.error(f"File '{file_path}' does not exist.")


def validate_image(post_data, ext):
    if len(post_data) > MAX_FILE_SIZE:
        raise Exception('File too large')
    if ext not in FILE_EXTENSIONS:
        raise Exception('Not allowed extension')


def generate_unique_name(filename) -> str:
    return f'{filename}_{uuid.uuid4()}'

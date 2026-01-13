import logging

import psycopg
from psycopg import Connection

from config import DB_CONFIG

logger = logging.getLogger(__name__)


def get_db_connection() -> Connection:
    try:
        db = psycopg.connect(**DB_CONFIG)
        return db
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        raise


def execute_query(query, log_success, log_fail, params=None):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(query, params)
                conn.commit()
                logger.info(log_success)
    except Exception as e:
        logger.error(log_fail, e)
        raise

def fetch_query(query, params=None):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(query, params)
                result = cur.fetchall()
                logger.info(f"Query {query} executed successfully. Params: {params}. result: {result}")
                return result
    except Exception as e:
        logger.error(f'Failed to execute query: {e}')
        raise


def init_tables():
    query = """CREATE TABLE IF NOT EXISTS images (
                          id SERIAL PRIMARY KEY,
                          filename TEXT NOT NULL,
                          original_name TEXT NOT NULL,
                          size INTEGER NOT NULL,
                          upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          file_type TEXT NOT NULL
                        );"""
    log_success = "Tables initialized successfully or already exists"
    log_fail = "Failed to initialize tables"

    execute_query(query, log_success, log_fail)


def save_metadata(filename, original_name, size, file_type):
    query = """
        INSERT INTO images (filename, original_name, size, file_type)
        VALUES (%s, %s, %s, %s)
    """
    log_success = "Metadata saved successfully"
    log_fail = "Failed to save metadata"
    execute_query(query, log_success, log_fail, (filename, original_name, size, file_type))


def delete_metadata(image_id):
    query = """
        DELETE FROM images WHERE id = %s
    """
    log_success = "Metadata deleted successfully"
    log_fail = "Failed to delete metadata"
    execute_query(query, log_success, log_fail, (image_id,))

def get_images_metadata() -> list:
    query = """
        SELECT * FROM images
    """
    return fetch_query(query)

def get_image_metadata(image_id) -> list:
    query = """
        SELECT * FROM images WHERE id = %s
    """
    result = fetch_query(query, (image_id,))
    if not result:
        raise Exception("Image not found")
    return result[0]
import psycopg2
from psycopg2 import pool
from contextlib import contextmanager
import config
from logger_config import logger

# Pool global
db_pool = pool.SimpleConnectionPool(
    minconn=5,
    maxconn=50,
    host=config.POSTGRE_HOST,
    database=config.POSTGRE_DATABASE,
    user=config.POSTGRE_USER,
    password=config.POSTGRE_PASSWORD,
    port=config.POSTGRE_PORT
)

def get_conn():
    return db_pool.getconn()

def release_conn(conn):
    db_pool.putconn(conn)

@contextmanager
def get_cursor(log_queue="default", with_conn=False):
    conn = None
    cur = None
    try:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SET search_path TO {config.POSTGRE_DEFAULT_SCHEMA}")
        if with_conn:
            yield cur, conn
        else:
            yield cur
        conn.commit()
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"DB Error: {e}", queue=log_queue)
        raise
    finally:
        if cur:
            cur.close()
        if conn:
            release_conn(conn)


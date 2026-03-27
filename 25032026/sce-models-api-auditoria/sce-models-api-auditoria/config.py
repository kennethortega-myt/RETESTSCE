import dotenv
import os

dotenv.load_dotenv()

API_URL_CENTRO_COMPUTO = os.environ.get('API_URL_ORC')
RABBITMQ_HOST = os.environ.get('RABBITMQ_HOST')
RABBITMQ_PORT = os.environ.get('RABBITMQ_PORT')
RABBITMQ_USER = os.environ.get('RABBITMQ_USER')
RABBITMQ_PASSWORD = os.environ.get('RABBITMQ_PASSWORD')

IMAGES_DIR = os.environ.get("IMAGES_DIR")
SUB_DIR = os.environ.get("SUBCARPETA")

if SUB_DIR:
    IMAGES_DIR = os.path.join(IMAGES_DIR, SUB_DIR)
    os.makedirs(IMAGES_DIR, exist_ok=True)
    os.environ["IMAGES_DIR"] = IMAGES_DIR

POSTGRE_HOST = os.environ.get('DB_HOST')
POSTGRE_DATABASE = os.environ.get('DB_NAME')
POSTGRE_USER = os.environ.get('DB_USER')
POSTGRE_PASSWORD = os.environ.get('DB_PASSWORD')
POSTGRE_PORT = os.environ.get('DB_PORT')
POSTGRE_DEFAULT_SCHEMA = os.environ.get('DB_DEFAULT_SCHEMA')

PROCESS_WORKERS_NUM = os.environ.get('PROCESS_WORKERS_NUM')

try:
    PROCESS_WORKERS_NUM = int(PROCESS_WORKERS_NUM)
except (TypeError, ValueError):
    PROCESS_WORKERS_NUM = 4

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
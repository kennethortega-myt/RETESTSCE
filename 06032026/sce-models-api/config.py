import dotenv
import os
from logger_config import logger

logger.info("Cargando variables de entorno desde el archivo .env...")
dotenv.load_dotenv()
logger.info("Variables de entorno cargadas correctamente.")

API_URL_CENTRO_COMPUTO = os.environ.get('API_URL_ORC')
RABBITMQ_HOST = os.environ.get('RABBITMQ_HOST')
RABBITMQ_PORT = os.environ.get('RABBITMQ_PORT')
RABBITMQ_USER = os.environ.get('RABBITMQ_USER')
RABBITMQ_PASSWORD = os.environ.get('RABBITMQ_PASSWORD')

IMAGES_DIR = os.environ.get('IMAGES_DIR')

POSTGRE_HOST = os.environ.get('DB_HOST')
POSTGRE_DATABASE = os.environ.get('DB_NAME')
POSTGRE_USER = os.environ.get('DB_USER')
POSTGRE_PASSWORD = os.environ.get('DB_PASSWORD')
POSTGRE_PORT = os.environ.get('DB_PORT')
POSTGRE_DEFAULT_SCHEMA = os.environ.get('DB_DEFAULT_SCHEMA')

logger.info(f"Configuración cargada: API_URL_CENTRO_COMPUTO={API_URL_CENTRO_COMPUTO}, "
            f"RABBITMQ_HOST={RABBITMQ_HOST}, RABBITMQ_PORT={RABBITMQ_PORT}, "
            f"POSTGRE_HOST={POSTGRE_HOST}, POSTGRE_DATABASE={POSTGRE_DATABASE}, "
            f"POSTGRE_PORT={POSTGRE_PORT}, POSTGRE_DEFAULT_SCHEMA={POSTGRE_DEFAULT_SCHEMA}")

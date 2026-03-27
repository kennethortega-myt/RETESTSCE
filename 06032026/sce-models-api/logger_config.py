import logging
from logging.handlers import RotatingFileHandler
import os
import sys
import io

if os.name == 'nt':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

QUEUE_VALUES = [
    "VALIDATE",
    "PROCESS",
    "MIEMBROS_MESA",
    "LISTA_ELECTORES",
    "STAE",
    "default"
]

LOG_DIR = "logs"
os.makedirs(LOG_DIR, exist_ok=True)

class DevelopmentLogFilter(logging.Filter):
    def filter(self, record):
        return not getattr(record, 'prod', False)

class ProductionLogFilter(logging.Filter):
    def filter(self, record):
        return getattr(record, 'prod', False)

class QueueLogFilter(logging.Filter):
    def __init__(self, queue_name):
        super().__init__()
        self.queue_name = queue_name

    def filter(self, record):
        return getattr(record, "queue", "default") == self.queue_name

class CustomLogger(logging.Logger):
    def _inject_extra(self, prod, queue, kwargs):
        extra = kwargs.get('extra', {})
        extra['prod'] = prod
        extra['queue'] = queue or "default"
        kwargs['extra'] = extra
        return kwargs

    def debug(self, msg, *args, **kwargs):
        kwargs = self._inject_extra(kwargs.pop('prod', False),
                                    kwargs.pop('queue', None),
                                    kwargs)
        super().debug(msg, *args, **kwargs)

    def info(self, msg, *args, **kwargs):
        kwargs = self._inject_extra(kwargs.pop('prod', False),
                                    kwargs.pop('queue', None),
                                    kwargs)
        super().info(msg, *args, **kwargs)

    def warning(self, msg, *args, **kwargs):
        kwargs = self._inject_extra(kwargs.pop('prod', False),
                                    kwargs.pop('queue', None),
                                    kwargs)
        super().warning(msg, *args, **kwargs)

    def error(self, msg, *args, **kwargs):
        kwargs = self._inject_extra(kwargs.pop('prod', False),
                                    kwargs.pop('queue', None),
                                    kwargs)
        super().error(msg, *args, **kwargs)

    def critical(self, msg, *args, **kwargs):
        kwargs = self._inject_extra(kwargs.pop('prod', False),
                                    kwargs.pop('queue', None),
                                    kwargs)
        super().critical(msg, *args, **kwargs)

logging.setLoggerClass(CustomLogger)

logger = logging.getLogger("mi_logger")
logger.setLevel(logging.DEBUG)

formatter = logging.Formatter(
    "%(asctime)s - %(levelname)s - [%(queue)s] - %(message)s"
)

for queue_name in QUEUE_VALUES:

    handler = RotatingFileHandler(
        os.path.join(LOG_DIR, f"{queue_name}.log"),
        maxBytes=5 * 1024 * 1024,
        backupCount=3
    )

    handler.setFormatter(formatter)
    handler.setLevel(logging.DEBUG)
    handler.addFilter(QueueLogFilter(queue_name))

    logger.addHandler(handler)

console_handler = logging.StreamHandler(sys.stdout)
console_handler.setFormatter(formatter)
console_handler.setLevel(logging.DEBUG)
logger.addHandler(console_handler)


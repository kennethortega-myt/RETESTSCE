import threading
import os
from contextlib import contextmanager
import config
from db.db_handler import get_conn, release_conn
_thread_local = threading.local()

class ExecutionContext:
    def __init__(self):
        self.conn = None
        self.cur = None
        self.temp_files = set()
        self.permanent_files = set()
        self.failed = False

    def add_temp_file(self, path: str):
        if path:
            self.temp_files.add(path)

    def add_permanent_file(self, path: str):
        if path:
            self.permanent_files.add(path)

    def cleanup(self):
        """Elimina archivos temporales. Si fallo, tambien elimina permanentes."""
        all_files = self.temp_files.copy()
        if self.failed:
            all_files |= self.permanent_files

        for path in all_files:
            if os.path.exists(path):
                try:
                    os.remove(path)
                except Exception as e:
                    print(f"[WARN] No se pudo eliminar {path}: {e}")

        self.temp_files.clear()
        if self.failed:
            self.permanent_files.clear()


@contextmanager
def use_execution_context():
    ctx = ExecutionContext()
    _thread_local.ctx = ctx
    try:
        ctx.conn = get_conn()
        ctx.cur = ctx.conn.cursor()
        ctx.cur.execute(f"SET search_path TO {config.POSTGRE_DEFAULT_SCHEMA}")
        yield ctx
        ctx.conn.commit()
    except Exception:
        ctx.failed = True
        if ctx.conn:
            ctx.conn.rollback()
        raise
    finally:
        if hasattr(ctx, "cur") and ctx.cur:
            ctx.cur.close()
        if hasattr(ctx, "conn") and ctx.conn:
            release_conn(ctx.conn)
        ctx.cleanup()
        _thread_local.ctx = None

def get_context() -> ExecutionContext:
    """Obtiene el contexto activo del hilo."""
    return getattr(_thread_local, "ctx", None)

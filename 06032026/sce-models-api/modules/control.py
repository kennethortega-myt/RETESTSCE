import os
from datetime import datetime
import json
import cv2
from concurrent.futures import ThreadPoolExecutor
import db.model_integrity_state as integrity_state
from logger_config import logger
import config
import multiprocessing as mp
from models import actasmodel
from models.digitsdetector import DigitsDetector
from models.imageutils import ImageFromDisk, ImageFromMemory
from models.signvalidator import SignValidator
from models.votesprefprocesor import VotesPrefImageProcessor
from models.votesprocessor import VotesImageProcessor
from secciones_rectangulos import main_rectangulos
from secciones_miembros_mesa import get_secciones
from models.detectormodel.new_evaluate_image import evaluate_image_np_tiled
from db.progress import get_cantidad_agrupaciones_politicas, get_cantidad_columnas_preferenciales, get_secciones_by_abreviaturas
from db.progress import get_data_cab_acta, update_cab_acta, insert_det_acta_accion,select_det_acta_accion,get_guid_by_archivo_pk, download_file_from_dir_and_align, upload_file_to_dir_process_acta
from db.progress import get_data_tab_mesa, get_data_det_ubigeo_eleccion, get_data_mae_eleccion
from db.progress import get_coordenadas_por_eleccion_documento_electoral, insert_det_acta_rectangulo, get_seccion_abreviatura, procesar_marcadores, get_valor_copia_a_color, get_digitalizacion_flags, get_digitalizacion_procesamiento_manual_flag
from db.progress import delete_data_from_table, get_c_ubigeo_by_mesa_id, download_file_from_dir, procesar_marcadores_stae_vd, update_det_parametro_by_nombre, get_nombre_by_archivo_pk, get_codigo_eleccion_principal, get_n_tipo_transmision_by_mesa
from models.detectormodel.boxes_util import assign_bboxes_to_cells, evaluate_merge_bboxes
from models.detectormodel.contour_detector import evaluate_image_find_contour
from util.modules_utils import determinar_tipo_acta, obtener_cantidad_candidatos, obtener_contexto
from util import constantes
from models.tipo_acta import TipoActa
from models.votesprocessorbase import VotesProcessorBase
from models.imageutils import ImagesLoader
from db.model_reset import reset_models_for_acta
from models.binarymodel.valid_trazo_classification import load_multiclass_model
from models.mnistmodel.model import load_model
import numpy as np
from pdf2image import convert_from_path
from pathlib import Path
from dataclasses import dataclass
from typing import Any, Optional
import traceback

from db.execution_context import use_execution_context, get_context, _thread_local

@dataclass
class SectionStaeVdParams:
    rectangle: Any
    name: str
    rec_id: str
    codigo_eleccion: str
    need_rotate: bool
    acta_type: str
    acta_id: int
    eleccion_id: int
    centro_computo: str = ""
    cod_usuario: str = ""

@dataclass
class SectionParams:
    rectangle: Any
    name: str
    rec_id: str
    codigo_eleccion: str
    copia_a_color: bool
    need_rotate: bool
    rows: int
    acta_type: str
    acta_id: int
    eleccion_id: int
    img_limpia_path: Optional[str] = None
    point0: Optional[Any] = None
    point1: Optional[Any] = None
    point2: Optional[Any] = None
    point3: Optional[Any] = None
    guide_lines: Optional[Any] = None
    acta_observada: bool = False
    centro_computo: str = ""
    cod_usuario: str = ""

@dataclass
class ProcessContext:
    acta_id: int
    eleccion_id: int
    acta_type: str
    codigo_eleccion: str
    file1_path: str
    config_map: dict
    need_rotate: bool
    copia_a_color: bool
    acta_observada: bool
    is_convencional: bool
    centro_computo: str
    cod_usuario: str

@dataclass
class VotosSectionParams:
    rec_loader: Any
    name: str
    rows: int
    is_convencional: bool
    section: SectionParams


@dataclass
class VotosParams(SectionParams):
    rec_loader: Any = None
    columns: Optional[int] = None # solo preferencial
@dataclass
class VotesProcessingContext:
    centro_computo: str
    cod_usuario: str
    rows: int
    codigo_eleccion: int
    is_coordenadas: bool
    copia_a_color: bool
    pipe_implemented: bool
    is_convencional: bool

@dataclass
class TotalVotesContext(VotesProcessingContext):
    vote_columns: list
    total_rows: int

@dataclass
class PrefVotesContext(VotesProcessingContext):
    columns: int

@dataclass
class PrefRowProcessingContext:
    pfctx: PrefVotesContext
    columns_count: int
    cell_bboxes_map: dict | None
    pipe_status_map: dict | None


def make_votos_params_preferenciales(
    base_params: SectionParams,
    rec_loader: Any,
    columns: int
) -> VotosParams:
    """Construye los parámetros para votos preferenciales"""
    return VotosParams(
        **base_params.__dict__,
        rec_loader=rec_loader,
        columns=columns
    )

def make_votos_params_normales(
    base_params: SectionParams,
    rec_loader: Any
) -> VotosParams:
    """Construye los parámetros para votos normales"""
    return VotosParams(
        **base_params.__dict__,
        rec_loader=rec_loader
    )

def extract_rectangles(source_file, rectangles, acta_observada, is_convencional, square_coords, process_type = True, log_queue = constantes.QUEUE_LOGGER_VALUE_PROCESS):
  if process_type ==True:
    rectangles = [(
      x['section']['id'],
      (x['topLeft']['x'], x['topLeft']['y']),
      (x['bottomRight']['x'], x['bottomRight']['y'])
    ) for x in rectangles]

  logger.info(f"source_file extract_rectangles: {source_file}", queue = log_queue)
  image_loader = ImageFromDisk(source_file, log_queue)
  return actasmodel.extract_rectangles(image_loader, rectangles, acta_observada, is_convencional, square_coords, log_queue)


def prepare_votes_data_revocatoria(table_data, centro_computo,cod_usuario, rows, codigo_eleccion, copia_a_color):
  is_coordenadas = False

  votes_column = [0, 1, 2, 3, 4]  # Columnas de los votos
  headers = ["ORGANIZACIONES POLITICAS", ""]  # Encabezados de la tabla
  body = []
  load_multiclass_model(cod_usuario)
  load_model(cod_usuario)
  for i, row_data in enumerate(table_data):
      row = {
          "nro": i + 1,
          "oopp": "",  # Ahora se deja vacío por defecto
      }
      for j, vote_col in enumerate(votes_column):
          hora_ms = datetime.now().strftime("%H_%M_%S_%f")
          fecha_hora = datetime.now().strftime("%Y_%m_%d")
          file_path = f"vote_{i+1}_{j}_{fecha_hora}_{hora_ms}.png"
          cv2.imwrite(file_path, row_data[vote_col])
          ctx = get_context()
          if ctx:
            ctx.add_temp_file(file_path)
          archivo_id = upload_file_to_dir_process_acta(file_path, cod_usuario=cod_usuario, centro_computo=centro_computo)
          predicted_number = DigitsDetector(ImageFromMemory(row_data[vote_col])).get_number(rows, codigo_eleccion, True, False, is_coordenadas, copia_a_color, pipe_implemented=False, cod_usuario=cod_usuario)
          row[f"total_votos_{j}"] = {
              "predicted": predicted_number,
              "file": archivo_id
          }
      body.append(row)
  logger.info(body, queue = constantes.QUEUE_LOGGER_VALUE_PROCESS)
  return headers, body

def prepare_votes_data_paralelo(table_data, ans_preprocess, centro_computo, cod_usuario, rows, codigo_eleccion, 
                                is_coordenadas, copia_a_color, matriz_info, filtered_img, is_convencional,
                                pipe_implemented = True, error_corte_tabla = False):
    """
    Versión optimizada con procesamiento en paralelo usando ThreadPoolExecutor.
    """
    logger.info(f"Comienza el procesamiento paralelo de la tabla de votos totales, tabla localizada = {not error_corte_tabla}", queue = constantes.QUEUE_LOGGER_VALUE_PROCESS)

    row_count = len(table_data)
    headers = ["ORGANIZACIONES POLITICAS", ""]
    if error_corte_tabla:
        return headers, [], []
    
    cell_bboxes_map = None
    pipe_status_map = None
    if pipe_implemented:
        # Convertir binaria → RGB si es necesario
        if len(filtered_img.shape) == 2:
            filtered_rgb = cv2.cvtColor(filtered_img, cv2.COLOR_GRAY2RGB)
        else:
            filtered_rgb = filtered_img
        bboxes_logic = evaluate_image_find_contour(filtered_rgb)
        bboxes_model = evaluate_image_np_tiled(filtered_rgb, cod_usuario)
        bboxes_final, pipe_status_map = evaluate_merge_bboxes(
            bboxes_logic,
            bboxes_model,
            matriz_info,
            filtered_rgb,
            cod_usuario
        )
        cell_bboxes_map = assign_bboxes_to_cells(bboxes_final, matriz_info, filtered_img)
        logger.info(f"{len(bboxes_final)} bounding boxes cargados y asignados a celdas.", queue=constantes.QUEUE_LOGGER_VALUE_PROCESS)

    vote_columns = [0]
    logger.info(f"Procesamiento con {row_count} filas", queue = constantes.QUEUE_LOGGER_VALUE_PROCESS)
    tvctx = TotalVotesContext(
        centro_computo=centro_computo,
        cod_usuario=cod_usuario,
        rows=rows,
        codigo_eleccion=codigo_eleccion,
        vote_columns=vote_columns,
        total_rows=row_count,
        is_coordenadas=is_coordenadas,
        copia_a_color=copia_a_color,
        pipe_implemented=pipe_implemented,
        is_convencional=is_convencional
    )
    main_ctx = get_context()
    load_multiclass_model(cod_usuario)
    load_model(cod_usuario)

    def thread_safe_process_vote(i):
        _thread_local.ctx = main_ctx
        try:
            return process_total_votes(
                i,
                table_data[i],
                ans_preprocess[i] if ans_preprocess is not None else None,
                cell_bboxes_map,
                pipe_status_map,
                tvctx
            )
        finally:
            _thread_local.ctx = None

    with ThreadPoolExecutor(max_workers=min(row_count, os.cpu_count() * 2)) as executor:
        processed_rows = list(executor.map(thread_safe_process_vote, range(row_count)))

    footer_count = min(3, len(processed_rows))
    body = [row for row in processed_rows[:-footer_count] if "nro" in row]
    footer = processed_rows[-footer_count:]

    return [headers, body, footer]

def process_total_votes(i, row_data, row_preproc, cell_bboxes_map, pipe_status_map, tvctx: TotalVotesContext):

    if not isinstance(row_data, list) or len(row_data) == 0:
        return {"nro": i + 1}

    # Fila o Footer?
    is_footer = (i >= tvctx.total_rows - 3)
    row = {"item": ""} if is_footer else {"nro": i + 1}

    detector = DigitsDetector(None)
    for j, vote_col in enumerate(tvctx.vote_columns):
        if vote_col >= len(row_data):
            continue


        hora_ms = datetime.now().strftime("%H_%M_%S_%f")
        fecha_hora = datetime.now().strftime("%Y_%m_%d")
        file_path = f"vote_{i+1}_{j}_{fecha_hora}_{hora_ms}.png"

        _, buffer = cv2.imencode(".png", row_data[vote_col])
        ctx = get_context()
        if ctx:
            ctx.add_temp_file(file_path)

        archivo_id = upload_file_to_dir_process_acta(file_path="",cod_usuario=tvctx.cod_usuario,centro_computo=tvctx.centro_computo,file_bytes=buffer.tobytes())
        cell_bboxes = None
        cell_pipe_implemented = False
        if tvctx.pipe_implemented:
            cell_bboxes = cell_bboxes_map.get((i, j), [])
            cell_pipe_implemented = pipe_status_map.get((i, j), False)
        if row_preproc:
            vote_img = row_preproc[vote_col]
        else:
            vote_img = row_data[vote_col]
        detector.image_loader = ImageFromMemory(vote_img)
        predicted_number = detector.get_number(tvctx.rows, tvctx.codigo_eleccion, True, False, tvctx.is_coordenadas, 
                                                                                tvctx.copia_a_color, tvctx.pipe_implemented, tvctx.cod_usuario, cell_bboxes, tvctx.is_convencional,
                                                                                cell_pipe_implemented = cell_pipe_implemented)
        row[f"total_votos_{j}"] = {
            "predicted": predicted_number,
            "file": archivo_id
        }

    return row

def process_pref_row(i, row_data, row_preproc, row_ctx: PrefRowProcessingContext):
    """Función auxiliar para procesar una fila individual"""
    logger.info("ejecutando process_pref_row...", queue = constantes.QUEUE_LOGGER_VALUE_PROCESS)
    detector = DigitsDetector(None)
    pfctx = row_ctx.pfctx
    if i < 2:
        logger.info("start", queue = constantes.QUEUE_LOGGER_VALUE_PROCESS)

    row = {
        "nro": i + 1,
    }

    for j in range(row_ctx.columns_count):
        hora_ms = datetime.now().strftime("%H_%M_%S_%f")
        fecha_hora = datetime.now().strftime("%Y_%m_%d")
        file_path = f"vote_{i+1}_{j}_{fecha_hora}_{hora_ms}.png"
        
        _, buffer = cv2.imencode(".png", row_data[j])
        ctx = get_context()
        if ctx:
            ctx.add_temp_file(file_path)
        archivo_id = upload_file_to_dir_process_acta(file_path="",cod_usuario=pfctx.cod_usuario,centro_computo=pfctx.centro_computo,file_bytes=buffer.tobytes())
        cell_bboxes = None
        cell_pipe_implemented = False
        if row_preproc:
            vote_img_pref = row_preproc[j]
        else:
            vote_img_pref = row_data[j]
        if pfctx.pipe_implemented:
            cell_bboxes = row_ctx.cell_bboxes_map.get((i, j), [])
            cell_pipe_implemented = row_ctx.pipe_status_map.get((i, j), False)
        detector.image_loader = ImageFromMemory(vote_img_pref)
        predicted_number = detector.get_number(pfctx.rows, pfctx.codigo_eleccion, False, False, pfctx.is_coordenadas, 
                                                                                     pfctx.copia_a_color, pfctx.pipe_implemented, pfctx.cod_usuario, cell_bboxes, 
                                                                                     pfctx.is_convencional, cell_pipe_implemented = cell_pipe_implemented)
        row[f"votos_{j + 1}"] = {
            "predicted": predicted_number,
            "file": archivo_id
        }
    return row

def prepare_votes_pref_data(table_data, ans_preprocess, pfctx:PrefVotesContext, matriz_info, filtered_img, error_corte_tabla=False):
    
    logger.info(f"Comienza el procesamiento paralelo de la tabla de votos preferenciales, tabla localizada = {not error_corte_tabla}", queue = constantes.QUEUE_LOGGER_VALUE_PROCESS)

    headers = ['' for _ in range(pfctx.columns)]
    if error_corte_tabla:
        return headers, [], []
    
    cell_bboxes_map = None
    pipe_status_map = None
    if pfctx.pipe_implemented:
        if len(filtered_img.shape) == 2:
            filtered_rgb = cv2.cvtColor(filtered_img, cv2.COLOR_GRAY2RGB)
        else:
            filtered_rgb = filtered_img
        bboxes_logic = evaluate_image_find_contour(filtered_rgb)
        bboxes_model = evaluate_image_np_tiled(filtered_rgb, pfctx.cod_usuario)
        bboxes_final, pipe_status_map = evaluate_merge_bboxes(
            bboxes_logic,
            bboxes_model,
            matriz_info,
            filtered_rgb,
            pfctx.cod_usuario
        )
        cell_bboxes_map = assign_bboxes_to_cells(bboxes_final, matriz_info, filtered_img)
        logger.info(f"{len(bboxes_final)} bounding boxes cargados y asignados a celdas.", queue=constantes.QUEUE_LOGGER_VALUE_PROCESS)

    columns_count = len(table_data[0])

    logger.info(f"Procesamiento con {len(table_data)} filas y {columns_count} columnas", queue = constantes.QUEUE_LOGGER_VALUE_PROCESS)
    row_ctx = PrefRowProcessingContext(
        pfctx=pfctx,
        columns_count=columns_count,
        cell_bboxes_map=cell_bboxes_map,
        pipe_status_map=pipe_status_map
    )

    main_ctx = get_context()
    def thread_safe_process_row(i, row_data):
        """Copia el contexto principal al hilo actual antes de procesar"""
        _thread_local.ctx = main_ctx
        try:
            return process_pref_row(
                i,
                row_data,
                ans_preprocess[i] if ans_preprocess is not None else None,
                row_ctx
            )
        finally:
            _thread_local.ctx = None

    load_multiclass_model(pfctx.cod_usuario)
    load_model(pfctx.cod_usuario)
    def process_with_threads():
        with ThreadPoolExecutor(max_workers=min(len(table_data), mp.cpu_count() * 2)) as executor:
            futures = [
                executor.submit(thread_safe_process_row, i, row_data)
                for i, row_data in enumerate(table_data)
            ]
            return [future.result() for future in futures]

    def process_sequential():
        body = []
        for i, row_data in enumerate(table_data):
            body.append(process_pref_row(
                i,
                row_data,
                ans_preprocess[i] if ans_preprocess is not None else None,
                row_ctx
            ))
        return body

    try:
        body = process_with_threads()
        logger.info(f"Procesamiento paralelo completado con {len(body)} filas", queue=constantes.QUEUE_LOGGER_VALUE_PROCESS)
    except Exception as e:
        logger.warning(f"Error en procesamiento paralelo, usando secuencial: {e}", queue=constantes.QUEUE_LOGGER_VALUE_PROCESS)
        body = process_sequential()

    return headers, body

def _process_rectangles_calidad_solo(rectangle, rec_id, rtgctx: ProcessContext):

    section_name = rtgctx.config_map[rec_id].lower().replace(" ", "_")
    final_name, temp_name = generate_file_names(section_name)
    temp_path = os.path.join(os.path.dirname(final_name), temp_name)
    save_and_prepare_image(rectangle, final_name, temp_path)

    name = final_name
    archive_doc_id = _save_rotated_image(rtgctx.acta_type, rtgctx.codigo_eleccion, final_name, section_name, rtgctx.centro_computo, rtgctx.cod_usuario)
    
    params = SectionStaeVdParams(
        rectangle=rectangle,
        name=name,
        rec_id=rec_id,
        codigo_eleccion=rtgctx.codigo_eleccion,
        need_rotate=rtgctx.need_rotate,
        acta_type=rtgctx.acta_type,
        acta_id=rtgctx.acta_id,
        eleccion_id=rtgctx.eleccion_id,
        centro_computo=rtgctx.centro_computo,
        cod_usuario=rtgctx.cod_usuario
    )

    data = process_section_stae_vd(params)

    insert_det_acta_rectangulo(rtgctx.acta_id, rtgctx.eleccion_id, rtgctx.acta_type, archive_doc_id, data, constantes.QUEUE_LOGGER_VALUE_PROCESS)

def new_flujo_cortes_calidad_only(acta_id, file_id, is_convencional, eleccion_id, acta_type, copia_a_color, is_instalacion_sufragio, centro_computo, cod_usuario):
    acta_observada = True
    file1_path, square_coords = _download_and_log(file_id, acta_observada, is_convencional)
    config_map, rectangles = _prepare_rectangles(file1_path, acta_observada, is_convencional, eleccion_id, acta_type, square_coords, is_instalacion_sufragio = is_instalacion_sufragio)
    
    need_rotate = acta_type in [
            constantes.ABREV_ACTA_INSTALACION_SUFRAGIO,
            constantes.ABREV_ACTA_ESCRUTINIO_HORIZONTAL,
            constantes.ABREV_ACTA_ESCRUTINIO_STAE_HORIZONTAL,
            constantes.ABREV_ACTA_ESCRUTINIO_HORIZONTAL_EXTRANJERO,
            constantes.ABREV_ACTA_INSTALACION_SUFRAGIO_EXTRANJERO,
        ]

    for rec_id, rectangle in rectangles:
            rtgctx = ProcessContext(
            acta_id=acta_id,
            eleccion_id=eleccion_id,
            acta_type=acta_type,
            codigo_eleccion=str(eleccion_id),
            file1_path=file1_path,
            config_map=config_map,
            need_rotate=need_rotate,
            copia_a_color=copia_a_color,
            acta_observada=acta_observada,
            is_convencional=is_convencional,
            centro_computo=centro_computo,
            cod_usuario=cod_usuario
            )
            _process_rectangles_calidad_solo(rectangle, rec_id, rtgctx)
    
    if file1_path and os.path.exists(file1_path):
        try:
            os.remove(file1_path)
            logger.info(f"Archivo de imagen temporarl eliminado correctamente: {file1_path}", queue=constantes.QUEUE_LOGGER_VALUE_PROCESS)
        except Exception as remove_error:
            logger.warning(f"No se pudo eliminar el archivo de imagen temporal {file1_path}: {remove_error}", queue=constantes.QUEUE_LOGGER_VALUE_PROCESS)


def process_file(acta_id, eleccion_id, codigo_eleccion, acta_type, file_id,
                 copia_a_color, acta_observada, is_convencional, 
                 flag_procesamiento_manual, centro_computo="", cod_usuario=""):

    logger.info(f"Procesing acta_id:{acta_id}, file: {file_id}, elección: {eleccion_id}, tipo acta: {acta_type}", queue = constantes.QUEUE_LOGGER_VALUE_PROCESS)
    file1_path = None
    is_instalacion_sufragio = acta_type in [
            constantes.ABREV_ACTA_INSTALACION_SUFRAGIO,
            constantes.ABREV_ACTA_INSTALACION_SUFRAGIO_EXTRANJERO
        ]
    if flag_procesamiento_manual:
        logger.warning(f"Ejecutando cortes MANUALES de respaldo para acta {acta_id}",queue=constantes.QUEUE_LOGGER_VALUE_PROCESS)
        new_flujo_cortes_calidad_only(
            acta_id, file_id, is_convencional, eleccion_id,
            acta_type, copia_a_color, is_instalacion_sufragio,
            centro_computo, cod_usuario
        )
        return
    try:
        file1_path, square_coords = _download_and_log(file_id, acta_observada, is_convencional)
        is_instalacion_sufragio = acta_type in [
            constantes.ABREV_ACTA_INSTALACION_SUFRAGIO,
            constantes.ABREV_ACTA_INSTALACION_SUFRAGIO_EXTRANJERO
        ]
        config_map, rectangles = _prepare_rectangles(file1_path, acta_observada, is_convencional, eleccion_id, acta_type, square_coords, is_instalacion_sufragio)

        need_rotate = acta_type in [
            constantes.ABREV_ACTA_INSTALACION_SUFRAGIO,
            constantes.ABREV_ACTA_ESCRUTINIO_HORIZONTAL,
            constantes.ABREV_ACTA_ESCRUTINIO_STAE_HORIZONTAL,
            constantes.ABREV_ACTA_ESCRUTINIO_HORIZONTAL_EXTRANJERO,
            constantes.ABREV_ACTA_INSTALACION_SUFRAGIO_EXTRANJERO,
        ]

        for rec_id, rectangle in rectangles:
            rtgctx = ProcessContext(
            acta_id=acta_id,
            eleccion_id=eleccion_id,
            acta_type=acta_type,
            codigo_eleccion=codigo_eleccion,
            file1_path=file1_path,
            config_map=config_map,
            need_rotate=need_rotate,
            copia_a_color=copia_a_color,
            acta_observada=acta_observada,
            is_convencional=is_convencional,
            centro_computo=centro_computo,
            cod_usuario=cod_usuario
            )
            _process_rectangle(rectangle, rec_id, rtgctx)
    except Exception as e:
        logger.error(f"Error en process_file (acta_id={acta_id}, file_id={file_id}): {e}\n{traceback.format_exc()}",queue=constantes.QUEUE_LOGGER_VALUE_PROCESS)
        raise

    finally:
        if file1_path and os.path.exists(file1_path):
            try:
                os.remove(file1_path)
                logger.info(f"Archivo de imagen temporarl eliminado correctamente: {file1_path}", queue=constantes.QUEUE_LOGGER_VALUE_PROCESS)
            except Exception as remove_error:
                logger.warning(f"No se pudo eliminar el archivo de imagen temporal {file1_path}: {remove_error}", queue=constantes.QUEUE_LOGGER_VALUE_PROCESS)


def _download_and_log(file_id, acta_observada, is_convencional):
    ftp_uuid = get_guid_by_archivo_pk(file_id, constantes.QUEUE_LOGGER_VALUE_PROCESS)
    file1_path, square_coords = download_file_from_dir_and_align(ftp_uuid, acta_observada, is_convencional, log_queue=constantes.QUEUE_LOGGER_VALUE_PROCESS)
    logger.info(f"Procesando archivo con ftp_uuid:{ftp_uuid} y file1_path:{file1_path}", queue = constantes.QUEUE_LOGGER_VALUE_PROCESS)
    return file1_path, square_coords


def _prepare_rectangles(file1_path, acta_observada, is_convencional, eleccion_id, acta_type, square_coords, is_instalacion_sufragio):
    
    if is_instalacion_sufragio:
        eleccion_codigo = get_codigo_eleccion_principal(log_queue=constantes.QUEUE_LOGGER_VALUE_PROCESS)

        if eleccion_codigo is None:
            raise ValueError("No se encontró elección principal (n_principal = 1)")
    else:
        eleccion_codigo = eleccion_id
    datos = get_coordenadas_por_eleccion_documento_electoral(eleccion_codigo, acta_type, log_queue=constantes.QUEUE_LOGGER_VALUE_PROCESS)

    config_map = {datos[key][0]: datos[key][1] for key in datos}
    rectangles = [
        (datos[key][0],
         (float(datos[key][2]), float(datos[key][4])),
         (float(datos[key][3]), float(datos[key][5])))
        for key in datos
    ]
    rectangles = extract_rectangles(file1_path, rectangles, acta_observada, is_convencional, square_coords, process_type=False)
    return config_map, rectangles

def _process_rectangle(rectangle, rec_id, rtgctx: ProcessContext):

    section_name = rtgctx.config_map[rec_id].lower().replace(" ", "_")
    final_name, temp_name = generate_file_names(section_name)
    temp_path = os.path.join(os.path.dirname(final_name), temp_name)
    save_and_prepare_image(rectangle, final_name, temp_path)

    name = final_name
    img_limpia_path, point0, point1, point2, point3, guide_lines = None, None, None, None, None, None

    if not rtgctx.acta_observada:
        img_limpia_path, point0, point1, point2, point3, guide_lines = _maybe_procesar_marcadores(
            rtgctx.acta_type, rtgctx.codigo_eleccion, rtgctx.file1_path, name, rtgctx.acta_id,
            section_name, rtgctx.is_convencional, rtgctx.cod_usuario, rtgctx.centro_computo
        )

    archive_doc_id = _save_rotated_image(rtgctx.acta_type, rtgctx.codigo_eleccion, final_name, section_name, rtgctx.centro_computo, rtgctx.cod_usuario)

    rows = get_cantidad_agrupaciones_politicas(int(rtgctx.acta_id), constantes.QUEUE_LOGGER_VALUE_PROCESS)
    
    params = SectionParams(
        rectangle=rectangle,
        name=name,
        rec_id=rec_id,
        codigo_eleccion=rtgctx.codigo_eleccion,
        copia_a_color=rtgctx.copia_a_color,
        need_rotate=rtgctx.need_rotate,
        rows=rows,
        acta_type=rtgctx.acta_type,
        acta_id=rtgctx.acta_id,
        eleccion_id=rtgctx.eleccion_id,
        img_limpia_path=img_limpia_path,
        point0=point0,
        point1=point1,
        point2=point2,
        point3=point3,
        guide_lines=guide_lines,
        acta_observada=rtgctx.acta_observada,
        centro_computo=rtgctx.centro_computo,
        cod_usuario=rtgctx.cod_usuario
    )

    data = _process_section(params, rtgctx.is_convencional)

    insert_det_acta_rectangulo(rtgctx.acta_id, rtgctx.eleccion_id, rtgctx.acta_type, archive_doc_id, data, constantes.QUEUE_LOGGER_VALUE_PROCESS)

def _maybe_procesar_marcadores(acta_type, codigo_eleccion, file1_path, name, acta_id,
                               section_name, is_convencional, cod_usuario, centro_computo):

    is_preferencial = constantes.ABREV_TABLA_VOTO_PREFERENCIAL in name
    es_voto = constantes.ABREV_TABLA_VOTO_TOTAL in name and not is_preferencial

    if acta_type == constantes.ABREV_ACTA_INSTALACION_SUFRAGIO or acta_type == constantes.ABREV_ACTA_INSTALACION_SUFRAGIO_EXTRANJERO or not (es_voto or is_preferencial):
        return None, None, None, None, None, None

    ajustes = [True, False] if es_voto else [False]
    num_candidatos = get_cantidad_agrupaciones_politicas(int(acta_id), constantes.QUEUE_LOGGER_VALUE_PROCESS)

    img_limpia_path, point0, point1, point2, point3, guide_lines = None, None, None, None, None, None

    for ajustar in ajustes:
        result = procesar_marcadores(
            codigo_eleccion, acta_type, file1_path, name, num_candidatos, is_convencional, ajustar_corte_totales=ajustar
        )
        if not result:
            continue

        img_limpia_path, intersecciones, guide_lines = result
        point0, point1, point2, point3 = intersecciones

        if es_voto:
            processor = VotesProcessorBase(ImagesLoader())
            tipo = "columna" if ajustar else "tabla"
            archivos = processor.cortar_imagenes_total_votos(
                img_limpia_path, point0, point3, acta_id,
                section_name, tipo, cod_usuario, centro_computo
            )
            _insert_json_if_tabla(archivos, section_name, acta_id, codigo_eleccion, acta_type, tipo)

    return img_limpia_path, point0, point1, point2, point3, guide_lines


def _save_rotated_image(acta_type, codigo_eleccion, final_name, section_name, centro_computo, cod_usuario, is_convencional = constantes.FLUJO_CONVENCIONAL):
    now = datetime.now()
    fecha_hora = now.strftime("%Y_%m_%d")
    hora_ms = now.strftime("%H_%M_%S_%f")
    archive_doc_id = save_image_with_optional_rotation(acta_type, codigo_eleccion, final_name,section_name, 
                                                       fecha_hora, hora_ms, centro_computo, 
                                                       cod_usuario, is_convencional)
    return archive_doc_id


def _get_rotation_decision(
    acta_type,
    codigo_eleccion,
    final_name,
    is_convencional
):
    """
    Retorna:
    - must_rotate (bool)
    - rotate_left (bool)  → True = 90° CCW, False = 90° CW
    """
    rotate_flag = False
    tipo = TipoActa(codigo_eleccion)
    if constantes.ABREV_FIRMA_PERSONEROS in final_name:
        if is_convencional == constantes.FLUJO_CONVENCIONAL:
            rotate_flag = tipo.get_personero_rotation_flag()
        else:
            rotate_flag = tipo.get_personero_stae_rotation_flag()

    if is_convencional == constantes.FLUJO_CONVENCIONAL:
        must_rotate = (
            acta_type in {
                constantes.ABREV_ACTA_ESCRUTINIO_HORIZONTAL,
                constantes.ABREV_ACTA_ESCRUTINIO_STAE_HORIZONTAL,
                constantes.ABREV_ACTA_ESCRUTINIO_HORIZONTAL_EXTRANJERO,
            }
            or rotate_flag
        )
        return must_rotate, False

    if is_convencional == constantes.FLUJO_STAE:
        must_rotate = acta_type in {
            constantes.ABREV_ACTA_INSTALACION_STAE,
            constantes.ABREV_ACTA_SUFRAGIO_STAE,
        } or rotate_flag
        must_rotate_left = acta_type in {
            constantes.ABREV_ACTA_INSTALACION_STAE,
            constantes.ABREV_ACTA_SUFRAGIO_STAE,
        }
        return must_rotate, must_rotate_left

    return rotate_flag, False


def save_image_with_optional_rotation(
    acta_type,
    codigo_eleccion,
    final_name,
    section_name,
    fecha_hora,
    hora_ms,
    centro_computo,
    cod_usuario,
    is_convencional=constantes.FLUJO_CONVENCIONAL
):

    must_rotate, rotate_left = _get_rotation_decision(
        acta_type,
        codigo_eleccion,
        final_name,
        is_convencional
    )

    if must_rotate:
        img = cv2.imread(final_name)
        final_name_rotated = f"{section_name}_rotated_{fecha_hora}_{hora_ms}.png"

        rotation = (
            cv2.ROTATE_90_COUNTERCLOCKWISE
            if rotate_left
            else cv2.ROTATE_90_CLOCKWISE
        )

        img = cv2.rotate(img, rotation)
        cv2.imwrite(final_name_rotated, img)

        ctx = get_context()
        if ctx:
            ctx.add_temp_file(final_name_rotated)

        return upload_file_to_dir_process_acta(
            final_name_rotated,
            cod_usuario=cod_usuario,
            centro_computo=centro_computo
        )

    ctx = get_context()
    if ctx:
        ctx.add_temp_file(final_name)

    return upload_file_to_dir_process_acta(
        final_name,
        cod_usuario=cod_usuario,
        centro_computo=centro_computo
    )


def _process_section(params: SectionParams, is_convencional) -> dict:

    data = {"n_seccion": params.rec_id}

    if constantes.ABREV_FIRMA in params.name:
        data["b_valido"] = process_firma_section(params.rectangle, params.name, params.codigo_eleccion, params.copia_a_color, is_convencional)

    elif constantes.ABREV_VOTO in params.name:
        rec_loader = ImageFromMemory(params.rectangle, rotate=params.need_rotate)
        votos_params = VotosSectionParams(
            rec_loader=rec_loader,
            name=params.name,
            rows=params.rows,
            is_convencional=is_convencional,
            section=params
        )
        votos_data = process_votos_section(votos_params)
        data["c_votos"] = json.dumps(votos_data)

    elif constantes.ABREV_TOTAL_CIUDADANOS in params.name:
        load_multiclass_model(params.cod_usuario)
        load_model(params.cod_usuario)
        data["c_valor_modelo"] = DigitsDetector(
            ImageFromMemory(params.rectangle, rotate=params.need_rotate)
        ).get_number(params.rows, params.codigo_eleccion, True, True, is_coordenadas=False, copia_a_color=params.copia_a_color, 
                     pipe_implemented=True, cod_usuario = params.cod_usuario, is_convencional=is_convencional)

    return data

def _insert_json_if_tabla(archivos, section_name, acta_id, eleccion_id, acta_type, tipo):
    processor = VotesProcessorBase(ImagesLoader())
    temp_json_path = None
    try:
        json_result, temp_json_path = processor.generar_json_votos(archivos, section_name)
        if tipo == "tabla":
            insert_json_votos_by_abreviatura(
                acta_id, eleccion_id, acta_type, "TOT_VOTOS", json_result
            )
    except Exception as e:
        import traceback
        logger.error(f"Error generando el json del segundo control de calidad (TOTAL_VOTOS): {e}\n{traceback.format_exc()}", queue = constantes.QUEUE_LOGGER_VALUE_PROCESS)
        raise

    finally:
        if tipo == "tabla" and temp_json_path and os.path.exists(temp_json_path):
            try:
                os.remove(temp_json_path)
                logger.info(f"Archivo temporal eliminado: {temp_json_path}", queue = constantes.QUEUE_LOGGER_VALUE_PROCESS)
            except Exception as cleanup_err:
                logger.error(f"No se pudo eliminar archivo temporal {temp_json_path}: {cleanup_err}", queue = constantes.QUEUE_LOGGER_VALUE_PROCESS)


def insert_json_votos_by_abreviatura(acta_id: int, eleccion_id: str, acta_type: str, abreviatura: str, votos_json: dict, log_queue:str = constantes.QUEUE_LOGGER_VALUE_PROCESS):
    try:
        secciones = get_secciones_by_abreviaturas([abreviatura])
        seccion = secciones.get(abreviatura)

        if not seccion:
            raise ValueError(f" Abreviatura no encontrada: {abreviatura}")

        data = {
            "n_seccion": seccion["n_seccion_pk"],
            "c_votos": json.dumps(votos_json)
        }

        archive_doc_id = None
        inserted_id = insert_det_acta_rectangulo(
            acta_id=acta_id,
            eleccion_id=eleccion_id,
            acta_type=acta_type,
            archive_doc_id=archive_doc_id,
            data=data,
            log_queue=log_queue
        )

        logger.info(f"Sección {abreviatura} insertada con ID {inserted_id}", queue = log_queue)
        return inserted_id

    except Exception as e:
        logger.info(f"Error en insert_json_votos_by_abreviatura ({abreviatura}): {e}", queue = constantes.QUEUE_LOGGER_VALUE_PROCESS)
        return None


def generate_file_names(section_name):
    now = datetime.now()
    hora_ms = now.strftime("%H_%M_%S_%f")
    fecha_hora = now.strftime("%Y_%m_%d")
    final_name = f"{section_name}_{fecha_hora}_{hora_ms}.png"
    temp_name = f"temp_{int(now.timestamp())}_{section_name}.png"
    return final_name, temp_name

def save_and_prepare_image(rectangle, final_name, temp_path):
    cv2.imwrite(temp_path, rectangle)
    ctx = get_context()
    if ctx:
        ctx.add_temp_file(temp_path)
    os.rename(temp_path, final_name)
    if ctx:
        ctx.temp_files.discard(temp_path)
        ctx.add_temp_file(final_name)

def rotate_image_if_needed(acta_type, codigo_eleccion, final_name, section_name, fecha_hora, hora_ms, centro_computo, cod_usuario):
    rotate_flag = False
    if constantes.ABREV_FIRMA_PERSONEROS in final_name:
        tipo = TipoActa(codigo_eleccion)
        rotate_flag = tipo.get_personero_rotation_flag()

    if acta_type in [constantes.ABREV_ACTA_ESCRUTINIO_HORIZONTAL, constantes.ABREV_ACTA_ESCRUTINIO_STAE_HORIZONTAL, constantes.ABREV_ACTA_ESCRUTINIO_HORIZONTAL_EXTRANJERO] or rotate_flag:
        img = cv2.imread(final_name)
        final_name_rotated = f"{section_name}_rotated_{fecha_hora}_{hora_ms}.png"
        img = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)
        cv2.imwrite(final_name_rotated, img)
        ctx = get_context()
        if ctx:
          ctx.add_temp_file(final_name_rotated)
        archivo_id = upload_file_to_dir_process_acta(final_name_rotated, cod_usuario=cod_usuario, centro_computo=centro_computo)
        return archivo_id
    ctx = get_context()
    archivo_id = upload_file_to_dir_process_acta(final_name, cod_usuario=cod_usuario, centro_computo=centro_computo)
    if ctx:
        ctx.add_temp_file(final_name)
    return archivo_id

def process_firma_section(rectangle, name, codigo_eleccion, copia_a_color, is_convencional):
    is_emc = False
    if codigo_eleccion in [constantes.COD_ELEC_DISTRITAL]:
        is_emc = True
    h, w = rectangle.shape[:2]
    rec_loader = ImageFromMemory(rectangle, rotate=h > w)
    if constantes.ABREV_FIRMA_PERSONEROS not in name:
        try:
            return SignValidator(rec_loader).validate(is_emc, copia_a_color, is_convencional)
        except Exception:
            return False
    return None

def process_votos_section(params: VotosSectionParams) -> dict:
    sect = params.section

    columns = get_cantidad_columnas_preferenciales(
        int(sect.acta_id),
        log_queue=constantes.QUEUE_LOGGER_VALUE_PROCESS
    )

    if constantes.ABREV_TABLA_VOTO_PREFERENCIAL in params.name:
        votos_params = make_votos_params_preferenciales(
            sect, params.rec_loader, columns
        )
        return _process_votos_preferenciales(votos_params, params.is_convencional)

    if sect.codigo_eleccion == constantes.COD_ELEC_REVOCATORIA:
        return _process_votos_revocatoria(
            params.rec_loader,
            sect.acta_id,
            sect.acta_type,
            sect.img_limpia_path,
            sect.point0, sect.point1, sect.point2, sect.point3,
            sect.centro_computo,
            sect.cod_usuario,
            params.rows,
            sect.codigo_eleccion,
            sect.copia_a_color
        )

    votos_params = make_votos_params_normales(sect, params.rec_loader)
    return _process_votos_normales(votos_params, params.is_convencional)


def _process_votos_preferenciales(params: VotosParams, is_convencional) -> dict:

    section_name = "voto_preferencial"
    error_corte_tabla = False

    if not params.acta_observada:
        info, ans_preprocess, matriz_info, filtered_img, archivos_columnas, is_coordenadas, pipe_implemented = VotesPrefImageProcessor(params.rec_loader).get_data_cortes_preferenciales_coordenadas(
            params.acta_id, params.img_limpia_path, params.point0, params.point1, params.point2, params.point3,
            params.guide_lines, params.copia_a_color, section_name, is_convencional, params.cod_usuario, params.centro_computo
        )
        os.remove(params.img_limpia_path)

        _insert_and_cleanup_json(
            archivos_columnas,section_name, 
            params.acta_id, params.eleccion_id, params.acta_type, "VOTO_PRE"
        )

    else:
        is_coordenadas = True
        pipe_implemented = True
        matriz_info = None
        filtered_img = None
        info, ans_preprocess, error_corte_tabla, archivos_columnas, matriz_info, filtered_img = VotesPrefImageProcessor(params.rec_loader).get_data_cortes_preferencial_observada(
            params.acta_id, section_name, params.cod_usuario, params.centro_computo, params.copia_a_color, is_convencional,
            log_queue=constantes.QUEUE_LOGGER_VALUE_PROCESS
        )
        
        _insert_and_cleanup_json(
            archivos_columnas, section_name,
            params.acta_id, params.eleccion_id, params.acta_type, "VOTO_PRE",
            params.rec_loader, params.cod_usuario, params.centro_computo
        )
    
    pfctx = PrefVotesContext(
        centro_computo=params.centro_computo,
        cod_usuario=params.cod_usuario,
        rows= params.rows,
        columns=params.columns,
        codigo_eleccion= params.codigo_eleccion,
        is_coordenadas = is_coordenadas,
        copia_a_color = params.copia_a_color,
        is_convencional = is_convencional,
        pipe_implemented=pipe_implemented
    )
    info = prepare_votes_pref_data(
        info, ans_preprocess, pfctx, matriz_info, 
        filtered_img, error_corte_tabla
    )

    return {"headers": info[0], "body": info[1]}

def _process_votos_revocatoria(rec_loader, acta_id, acta_type, img_limpia_path,
                               point0, point1, point2, point3,
                               centro_computo, cod_usuario, rows, codigo_eleccion, copia_a_color):

    if acta_type != constantes.ABREV_ACTA_INSTALACION_SUFRAGIO or constantes.ABREV_ACTA_INSTALACION_SUFRAGIO_EXTRANJERO:
        info = VotesImageProcessor(rec_loader).get_data_cortes_revocatoria_alterno(
            acta_id, img_limpia_path, point0, point1, point2, point3
        )
        os.remove(img_limpia_path)

    info = prepare_votes_data_revocatoria(info, centro_computo, cod_usuario, rows, codigo_eleccion, copia_a_color)
    return {"headers": info[0], "body": info[1]}

def _process_votos_normales(params: VotosParams, is_convencional) -> dict:

    error_corte_tabla = False
    if params.acta_type != constantes.ABREV_ACTA_INSTALACION_SUFRAGIO or constantes.ABREV_ACTA_INSTALACION_SUFRAGIO_EXTRANJERO:
        if not params.acta_observada:
            info, ans_preprocess, matriz_info, filtered_img, is_coordenadas, pipe_implemented = VotesImageProcessor(params.rec_loader).get_data_cortes_coordenadas(
                params.acta_id, params.img_limpia_path, params.point0, params.point1, params.point2, params.point3, params.guide_lines, params.copia_a_color,
                is_convencional
            )
            os.remove(params.img_limpia_path)
        else:
            is_coordenadas = True
            pipe_implemented = True
            matriz_info = None
            filtered_img = None
            section_name = "votos_por_agrupacion_politica"
            info, ans_preprocess, error_corte_tabla, archivos_columnas, matriz_info, filtered_img = VotesImageProcessor(params.rec_loader).get_data_cortes_observada(
                params.acta_id, section_name, params.codigo_eleccion, params.acta_type, params.cod_usuario, params.centro_computo, 
                params.copia_a_color, is_convencional,
                log_queue=constantes.QUEUE_LOGGER_VALUE_PROCESS
            )

            _insert_and_cleanup_json(
                archivos_columnas, section_name,
                params.acta_id, params.eleccion_id, params.acta_type, "TOT_VOTOS",
                params.rec_loader, params.cod_usuario, params.centro_computo
            )
    info = prepare_votes_data_paralelo(
        info, ans_preprocess, params.centro_computo, params.cod_usuario, params.rows,
        params.codigo_eleccion, is_coordenadas, params.copia_a_color, 
        matriz_info, filtered_img, is_convencional, pipe_implemented, error_corte_tabla,
    )

    return {"headers": info[0], "body": info[1], "footer": info[2]}

def _insert_and_cleanup_json(archivos, section_name,
                             acta_id, eleccion_id, acta_type, tipo,
                             rec_loader = None, cod_usuario = None, centro_computo = None):
    processor = VotesProcessorBase(ImagesLoader())
    temp_json_path = None
    try:
        json_result, temp_json_path = processor.generar_json_votos(
            archivos, section_name, rec_loader, cod_usuario, centro_computo
        )
        insert_json_votos_by_abreviatura(
            acta_id, eleccion_id, acta_type, tipo, json_result
        )
    except Exception as e:
        import traceback
        logger.error(f"Error generando el json del segundo control de calidad (TOTAL Y PREFERENCIAL): {e}\n{traceback.format_exc()}", queue = constantes.QUEUE_LOGGER_VALUE_PROCESS)
        raise

    finally:
        if temp_json_path and os.path.exists(temp_json_path):
            try:
                os.remove(temp_json_path)
                logger.info(f"Archivo json temporal eliminado: {temp_json_path}", queue = constantes.QUEUE_LOGGER_VALUE_PROCESS)
            except Exception as cleanup_err:
                logger.error(f"No se pudo eliminar el archivo json temporal {temp_json_path}: {cleanup_err}", queue = constantes.QUEUE_LOGGER_VALUE_PROCESS)


def process_files_lista_electores(mesa_id, abrev_documento, usuario, cod_centro_computo):
  logger.info(f"Generando Secciones: {mesa_id}", queue = constantes.QUEUE_LOGGER_VALUE_LISTA_ELECTORES)
  main_rectangulos(mesa_id, abrev_documento,usuario, cod_centro_computo)
  logger.info(f"Fin proceso generación de secciones LE: {mesa_id}", queue = constantes.QUEUE_LOGGER_VALUE_LISTA_ELECTORES)

def process_files_miembros_mesa(mesa_id, abrev_documento, contexto_mm, usuario, cod_centro_computo):
  logger.info(f"Generando Secciones Mm : {mesa_id}", queue = constantes.QUEUE_LOGGER_VALUE_MIEMBROS_MESA)
  get_secciones(mesa_id, abrev_documento, contexto_mm, usuario, cod_centro_computo)
  logger.info(f"Fin proceso, generación de secciones MMm: {mesa_id}", queue = constantes.QUEUE_LOGGER_VALUE_MIEMBROS_MESA)

def _determinar_acta_instalacion_sufragio(is_convencional: bool):
    if is_convencional == constantes.FLUJO_CONVENCIONAL:
        return constantes.ABREV_ACTA_INSTALACION_SUFRAGIO
    return constantes.ABREV_ACTA_INSTALACION_SUFRAGIO_EXTRANJERO


def process_acta(acta_id: int, file_id1: int, file_id2: int, cod_usuario: str, centro_computo: str):
    reset_models_for_acta()
    with use_execution_context() as ctx:
        try:
            logger.info(f"Procesando acta: {acta_id}, file_id1: {file_id1}, file_id2: {file_id2}, cod_usuario: {cod_usuario}, centro_computo: {centro_computo}.", queue = constantes.QUEUE_LOGGER_VALUE_PROCESS)
            
            observado_escrutinio, observado_instalacion_sufragio = get_digitalizacion_flags(acta_id)
            flag_procesamiento_manual = get_digitalizacion_procesamiento_manual_flag(acta_id, log_queue=constantes.QUEUE_LOGGER_VALUE_PROCESS)
            logger.info("Valor de Procesamiento Manual = %s",flag_procesamiento_manual, queue = constantes.QUEUE_LOGGER_VALUE_PROCESS)
            logger.info("Valor de Acta Observada Escrutinio = %s",observado_escrutinio, queue = constantes.QUEUE_LOGGER_VALUE_PROCESS)
            logger.info("Valor de Acta Observada Instalacion Sufragio = %s",observado_instalacion_sufragio, queue = constantes.QUEUE_LOGGER_VALUE_PROCESS)
            
            acta = get_data_cab_acta(acta_id, constantes.QUEUE_LOGGER_VALUE_PROCESS)
            
            if not acta or acta['n_archivo_escrutinio'] != file_id1 or acta['n_archivo_instalacion_sufragio'] != file_id2:
                _log_acta_validation_errors(acta, file_id1, file_id2)
                return
            
            valor_str = get_valor_copia_a_color()
            copia_a_color = valor_str.lower() == 'true'
            eleccion, ubigeo, tab_mesa, tipo_hoja_stae = obtener_contexto(acta, log_queue = constantes.QUEUE_LOGGER_VALUE_PROCESS)
            cantidad_candidatos = obtener_cantidad_candidatos(eleccion, ubigeo)

            is_convencional = constantes.FLUJO_CONVENCIONAL
            if ubigeo["c_ubigeo"][0] == "9": is_convencional = constantes.FLUJO_EXTRANJERO
            
            _procesar_escrutinio(
                acta_id, eleccion, tab_mesa, tipo_hoja_stae,
                cantidad_candidatos, file_id1, cod_usuario, centro_computo, copia_a_color, 
                observado_escrutinio, is_convencional, flag_procesamiento_manual
            )
            
            tipo_acta_instalacion = _determinar_acta_instalacion_sufragio(is_convencional)
            process_file(
                acta_id, eleccion['n_eleccion_pk'], eleccion['c_codigo'],
                tipo_acta_instalacion, file_id2, copia_a_color, observado_instalacion_sufragio, is_convencional,
                flag_procesamiento_manual, centro_computo=centro_computo, cod_usuario=cod_usuario
            )

            if integrity_state.HAY_FALLO_INTEGRIDAD_MODELOS:
                ok = update_det_parametro_by_nombre(cod_usuario, c_nombre="p_modelo_prediccion",nuevo_valor="false",log_queue=constantes.QUEUE_LOGGER_VALUE_PROCESS)
                if ok:
                    logger.warning("Parámetro p_modelo_prediccion DESACTIVADO por fallo de integridad de modelos",queue=constantes.QUEUE_LOGGER_VALUE_PROCESS)
                else:
                    logger.error("No se pudo desactivar p_modelo_prediccion tras fallo de integridad",queue=constantes.QUEUE_LOGGER_VALUE_PROCESS)
            
            _registrar_accion_final(acta_id, cod_usuario, centro_computo, log_queue=constantes.QUEUE_LOGGER_VALUE_PROCESS)
            logger.info(f"Procesamiento Finalizado: acta_id: {acta_id}, file_id1: {file_id1}, file_id2: {file_id2},", queue = constantes.QUEUE_LOGGER_VALUE_PROCESS)
        except Exception as e:
            logger.error(f"Error procesando el acta (acta_id={acta_id}): {e}\n{traceback.format_exc()}",queue=constantes.QUEUE_LOGGER_VALUE_PROCESS)
            ctx.failed = True
            try:
                rows_deleted = delete_data_from_table(
                    "det_acta_rectangulo", "n_acta", acta_id,
                    log_queue = constantes.QUEUE_LOGGER_VALUE_PROCESS
                )
                logger.info(f"Registros de rectángulos eliminados: {rows_deleted}",queue=constantes.QUEUE_LOGGER_VALUE_PROCESS)
                
                update_cab_acta(
                    acta_id,
                    {
                        'n_digitalizacion_escrutinio': 3,
                        'c_observacion_digitalizacion_escrutinio': 'error del modelo',
                        'c_aud_usuario_modificacion':cod_usuario,
                        'd_aud_fecha_modificacion': datetime.now()
                    },
                    constantes.QUEUE_LOGGER_VALUE_PROCESS
                )
                logger.info(f"Acta {acta_id} actualizada con estado de error del modelo.",queue=constantes.QUEUE_LOGGER_VALUE_PROCESS)
                _registrar_accion_final(acta_id, cod_usuario, centro_computo, log_queue=constantes.QUEUE_LOGGER_VALUE_PROCESS)
                logger.info(f"Procesamiento Finalizado con error: acta_id: {acta_id}, file_id1: {file_id1}, file_id2: {file_id2},", queue = constantes.QUEUE_LOGGER_VALUE_PROCESS)
            except Exception as nested_error:
                logger.error(f"Error al limpiar datos o actualizar acta tras fallo: {nested_error}\n{traceback.format_exc()}",queue=constantes.QUEUE_LOGGER_VALUE_PROCESS)
            raise

def _log_acta_validation_errors(acta, file_id1, file_id2):
    if acta is None:
        logger.info("Acta no encontrada.", queue = constantes.QUEUE_LOGGER_VALUE_PROCESS)
        return
    if acta['n_archivo_escrutinio'] != file_id1:
        logger.info(f"Error: n_archivo_escrutinio esperado: {acta['n_archivo_escrutinio']}, recibido: {file_id1}", queue = constantes.QUEUE_LOGGER_VALUE_PROCESS)
    if acta['n_archivo_instalacion_sufragio'] != file_id2:
        logger.info(f"Error: n_archivo_instalacion_sufragio esperado: {acta['n_archivo_instalacion_sufragio']}, recibido: {file_id2}", queue = constantes.QUEUE_LOGGER_VALUE_PROCESS)

def _ajustar_acta_por_convencional(tipo_acta, is_convencional):
    if is_convencional == constantes.FLUJO_CONVENCIONAL or not tipo_acta:
        return tipo_acta

    reemplazos = {
        constantes.ABREV_ACTA_ESCRUTINIO:
            constantes.ABREV_ACTA_ESCRUTINIO_EXTRANJERO,
        constantes.ABREV_ACTA_ESCRUTINIO_HORIZONTAL:
            constantes.ABREV_ACTA_ESCRUTINIO_HORIZONTAL_EXTRANJERO,
    }

    return reemplazos.get(tipo_acta, tipo_acta)


def _procesar_escrutinio(acta_id, eleccion, tab_mesa, tipo_hoja_stae,
                          cantidad_candidatos, file_id1, cod_usuario, 
                          centro_computo, copia_a_color, observado_escrutinio, 
                          is_convencional, flag_procesamiento_manual):

    codigo = eleccion['c_codigo']
    pk = eleccion['n_eleccion_pk']

    def pf(tipo_acta):
        process_file(
            acta_id, pk, codigo, tipo_acta, file_id1, copia_a_color, observado_escrutinio, is_convencional,
            flag_procesamiento_manual, centro_computo=centro_computo, cod_usuario=cod_usuario
        )

    is_stae = tab_mesa['n_solucion_tecnologica'] == constantes.SOLUCION_TECNOLOGICA_STAE

    tipo_acta = determinar_tipo_acta(codigo, is_stae, tipo_hoja_stae, cantidad_candidatos)
    tipo_acta = _ajustar_acta_por_convencional(tipo_acta, is_convencional)
    if tipo_acta:
        pf(tipo_acta)

def _registrar_accion_final(acta_id, cod_usuario, centro_computo, log_queue):
    nueva_iteracion = 1
    results = select_det_acta_accion({
        'c_accion': 'MODELO_PROCESAR',
        'n_acta': acta_id,
        'c_tiempo': 'FIN'
    }, log_queue=log_queue)

    if results and 'n_iteracion' in results[-1]:
        n = results[-1]['n_iteracion']
        if isinstance(n, (int, float)):
            nueva_iteracion = n + 1

    insert_det_acta_accion({
        'id_cab_acta': acta_id,
        'c_accion': 'MODELO_PROCESAR',
        'c_tiempo': 'FIN',
        'n_orden': 6,
        'n_iteracion': nueva_iteracion,
        'c_usuario_accion': cod_usuario,
        'd_fecha_accion': datetime.now(),
        'n_activo': 1,
        'c_codigo_centro_computo':centro_computo ,
        'c_aud_usuario_creacion': cod_usuario,
        'd_aud_fecha_creacion': datetime.now()
    }, log_queue=log_queue)


def process_lista_electores(mesa_id: int, abrev_documento: str, cod_usuario:str, cod_centrocomputo:str):

  try:
    logger.info(f"Procesando lista de electores de la mesa: {mesa_id}, abrev_documento: {abrev_documento}, cod_usuario: {cod_usuario} , cod_centrocomputo: {cod_centrocomputo}.", queue = constantes.QUEUE_LOGGER_VALUE_LISTA_ELECTORES)
    mesa = get_data_tab_mesa(mesa_id, constantes.QUEUE_LOGGER_VALUE_LISTA_ELECTORES)

    if mesa is None:
        logger.info(f"La mesa: {mesa_id}, no esta registrada en la BD.", queue = constantes.QUEUE_LOGGER_VALUE_LISTA_ELECTORES)
        return

    estado_digitalizacion_le = mesa['c_estado_digitalizacion_le']

    if estado_digitalizacion_le is None:
        logger.info(f"La columna c_estado_digitalizacion_le de la mesa : {mesa_id}, no esta registrada en la BD.", queue = constantes.QUEUE_LOGGER_VALUE_LISTA_ELECTORES)
        return

    if estado_digitalizacion_le != 'C':
        logger.info(f"La mesa : {mesa_id}, debe estar con estado_digitalizacion_le = 'C', de aprobada en LE.", queue = constantes.QUEUE_LOGGER_VALUE_LISTA_ELECTORES)

    process_files_lista_electores(mesa_id, abrev_documento, cod_usuario, cod_centrocomputo)
  except Exception as e:
        logger.error(
            f"Error en process_lista_electores (mesa_id={mesa_id}): {e}\n{traceback.format_exc()}",
            queue=constantes.QUEUE_LOGGER_VALUE_LISTA_ELECTORES
        )

def get_mm_contexto(solucion_tecnologica, extranjera, tipo_transmision):
    if (
        solucion_tecnologica == constantes.SOLUCION_TECNOLOGICA_STAE
        and tipo_transmision == constantes.TIPO_HOJA_CONTINGENCIA_A3
    ):
        return {
            "abrev_mm": constantes.ABREV_HOJA_ASISTENCIA_MM,
            "abrev_mmc": constantes.ABREV_RELACION_MM_NO_SORTEADOS,
            "is_convencional": constantes.FLUJO_CONVENCIONAL
        }

    if solucion_tecnologica == constantes.SOLUCION_TECNOLOGICA_STAE:
        return {
            "abrev_mm": constantes.ABREV_HOJA_ASISTENCIA_MM_STAE,
            "abrev_mmc": constantes.ABREV_RELACION_MM_NO_SORTEADOS_STAE,
            "is_convencional": constantes.FLUJO_STAE
        }

    if extranjera:
        return {
            "abrev_mm": constantes.ABREV_HOJA_ASISTENCIA_MM_EXTRANJERO,
            "abrev_mmc": constantes.ABREV_RELACION_MM_NO_SORTEADOS_EXTRANJERO,
            "is_convencional": constantes.FLUJO_EXTRANJERO
        }

    return {
        "abrev_mm": constantes.ABREV_HOJA_ASISTENCIA_MM,
        "abrev_mmc": constantes.ABREV_RELACION_MM_NO_SORTEADOS,
        "is_convencional": constantes.FLUJO_CONVENCIONAL
    }


def process_miembros_mesa(mesa_id: int, abrev_documento: str, cod_usuario:str, cod_centrocomputo:str):
  try:
    logger.info(f"Procesando miembros de mesa, de la mesa: {mesa_id}, abrev_documento: {abrev_documento}, cod_usuario: {cod_usuario}, cod_centrocomputo: {cod_centrocomputo}.", queue = constantes.QUEUE_LOGGER_VALUE_MIEMBROS_MESA)

    c_ubigeo = get_c_ubigeo_by_mesa_id(mesa_id=mesa_id, log_queue = constantes.QUEUE_LOGGER_VALUE_MIEMBROS_MESA)
    mesa = get_data_tab_mesa(mesa_id, constantes.QUEUE_LOGGER_VALUE_MIEMBROS_MESA)
    extranjera = c_ubigeo[0] == "9"
    solucion_tecnologica = mesa['n_solucion_tecnologica']
    tipo_transmision = get_n_tipo_transmision_by_mesa(mesa_id, log_queue=constantes.QUEUE_LOGGER_VALUE_MIEMBROS_MESA)
    contexto_mm = get_mm_contexto(solucion_tecnologica=solucion_tecnologica,extranjera=extranjera, tipo_transmision = tipo_transmision)

    # Validamos el config de MM y MMC
    logger.info(constantes.LIST_MM, queue = constantes.QUEUE_LOGGER_VALUE_MIEMBROS_MESA)
    config_mm_list = get_seccion_abreviatura(constantes.LIST_MM )
    config_mmc_list = get_seccion_abreviatura(constantes.LIST_MMC)
    config_mm_obs = get_seccion_abreviatura(constantes.OBS_MM)
    config_mmc_obs = get_seccion_abreviatura(constantes.OBS_MMC)

    # Validar si alguna sección no está registrada
    if any(config is None for config, name in [
        (config_mm_list, constantes.LIST_MM),
        (config_mmc_list, constantes.LIST_MMC),
        (config_mm_obs, constantes.OBS_MM),
        (config_mmc_obs, constantes.OBS_MMC)
    ]):
        missing_sections = [
            name for config, name in [
                (config_mm_list, constantes.LIST_MM),
                (config_mmc_list, constantes.LIST_MMC),
                (config_mm_obs, constantes.OBS_MM),
                (config_mmc_obs, constantes.OBS_MMC)
            ] if config is None
        ]
        logger.info(f"SECCIONES CONSTANTES NO ESTÁN REGISTRADAS EN LA BD: {', '.join(missing_sections)}", queue = constantes.QUEUE_LOGGER_VALUE_MIEMBROS_MESA)
    if mesa is None:
        logger.info(f"La mesa: {mesa_id}, no esta registrada en la BD.", queue = constantes.QUEUE_LOGGER_VALUE_MIEMBROS_MESA)
        return

    estado_digitalizacion_mm = mesa['c_estado_digitalizacion_mm']

    if estado_digitalizacion_mm is None:
        logger.info(f"La columna c_estado_digitalizacion_mm de la mesa : {mesa_id}, no esta registrada en la BD.", queue = constantes.QUEUE_LOGGER_VALUE_MIEMBROS_MESA)
        return

    if estado_digitalizacion_mm != 'C':
        logger.info(f"La mesa : {mesa_id}, debe estar con estadoDigitalizacionMm = 'C', de aprobada en MM.", queue = constantes.QUEUE_LOGGER_VALUE_MIEMBROS_MESA)

    process_files_miembros_mesa(mesa_id, abrev_documento, contexto_mm, cod_usuario, cod_centrocomputo)

  except Exception as e:
        logger.error(
            f"Error en process_miembros_mesa (mesa_id={mesa_id}): {e}\n{traceback.format_exc()}",
            queue=constantes.QUEUE_LOGGER_VALUE_MIEMBROS_MESA
        )


CORTES_SEGUNDA_HOJA = {
    constantes.SECCION_OBSERVACION_ESCRUTINIO
    }

def _prepare_rectangles_stae_vd(lista_filepaths, codigo_eleccion, tipo_acta):
    """
    Regla:
    - Cortes normales → SIEMPRE en la primera hoja
    - Cortes en CORTES_SEGUNDA_HOJA → SOLO en la última hoja (si aplica)
    - Nunca repetir cortes
    - Ignorar hojas intermedias
    """

    n_seccion_obs = get_seccion_abreviatura(constantes.SECCION_OBSERVACION_ESCRUTINIO, log_queue=constantes.QUEUE_LOGGER_VALUE_STAE)

    OBS_FALLBACK = (
        n_seccion_obs,
        constantes.SECCION_OBSERVACION_ESCRUTINIO,
        '0.2974746769503741',
        '0.9170920752276197',
        '0.6942405690000813',
        '0.7794919924917578'
    )

    is_instalacion_or_sufragio = tipo_acta in [
            constantes.ABREV_ACTA_INSTALACION_STAE,
            constantes.ABREV_ACTA_SUFRAGIO_STAE
        ]
    
    if is_instalacion_or_sufragio:
        eleccion_codigo = get_codigo_eleccion_principal(log_queue=constantes.QUEUE_LOGGER_VALUE_STAE)

        if eleccion_codigo is None:
            raise ValueError("No se encontró elección principal (n_principal = 1)")
    else:
        eleccion_codigo = codigo_eleccion

    assert isinstance(lista_filepaths, list)
    assert len(lista_filepaths) >= 1

    resultado = {
        "principal": None,
        "segunda_hoja": None  # nombre legado
    }

    datos = get_coordenadas_por_eleccion_documento_electoral(eleccion_codigo, tipo_acta, log_queue=constantes.QUEUE_LOGGER_VALUE_STAE)
    tiene_obs = any(
        datos[k][1] == constantes.SECCION_OBSERVACION_ESCRUTINIO
        for k in datos
    )
    is_convencional = constantes.FLUJO_STAE
    usa_hoja_final = (
        len(lista_filepaths) >= 2 and
        codigo_eleccion in (
            constantes.COD_ELEC_SENADO_UNICO,
            constantes.COD_ELEC_DIPUTADO,
            constantes.COD_ELEC_PARLAMENTO,
        )
    )
    file_path_principal = lista_filepaths[0]

    datos_principal = {
        key: datos[key]
        for key in datos
        if (
            datos[key][1] not in CORTES_SEGUNDA_HOJA or
            (tiene_obs and datos[key][1] == constantes.SECCION_OBSERVACION_ESCRUTINIO)
        )
    }

    config_map_principal = {
        datos_principal[key][0]: datos_principal[key][1]
        for key in datos_principal
    }

    rectangles_principal = [
        (
            datos_principal[key][0],
            (float(datos_principal[key][2]), float(datos_principal[key][4])),
            (float(datos_principal[key][3]), float(datos_principal[key][5]))
        )
        for key in datos_principal
    ]

    rectangles_principal = extract_rectangles(
        file_path_principal,
        rectangles_principal,
        acta_observada=False,
        square_coords=None,
        is_convencional=is_convencional,
        process_type=False,
        log_queue=constantes.QUEUE_LOGGER_VALUE_STAE
    )

    resultado["principal"] = {
        "file_path": file_path_principal,
        "config_map": config_map_principal,
        "rectangles": rectangles_principal
    }
    if usa_hoja_final:
        file_path_final = lista_filepaths[-1]

        datos_final = {
            key: datos[key]
            for key in datos
            if datos[key][1] in CORTES_SEGUNDA_HOJA
        }

        if not tiene_obs:
            datos_final = {
                OBS_FALLBACK[0]: OBS_FALLBACK
            }

        if datos_final:
            config_map_final = {
                datos_final[key][0]: datos_final[key][1]
                for key in datos_final
            }

            rectangles_final = [
                (
                    datos_final[key][0],
                    (float(datos_final[key][2]), float(datos_final[key][4])),
                    (float(datos_final[key][3]), float(datos_final[key][5]))
                )
                for key in datos_final
            ]

            rectangles_final = extract_rectangles(
                file_path_final,
                rectangles_final,
                acta_observada=False,
                square_coords=None,
                is_convencional=is_convencional,
                process_type=False,
                log_queue=constantes.QUEUE_LOGGER_VALUE_STAE
            )
            resultado["segunda_hoja"] = {
                "file_path": file_path_final,
                "config_map": config_map_final,
                "rectangles": rectangles_final
            }
    return resultado



def cortar_imagenes_control_calidad(resultados, acta_id, cod_usuario, centro_computo):
    """
    Guarda y sube imágenes ya recortadas STAE/VD.
    - total_votos: upload_file_to_dir_process_acta
    - preferenciales: _procesar_columnas_preferenciales_stae_vd
    """

    struct_archivos = {
        "total_votos": [],
        "preferenciales": []
    }

    ctx = get_context()
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S%f')
    for item in resultados:
        if item["tipo"] != "total_votos":
            continue

        imagen = item["imagen"]
        ajuste = item["ajuste"]

        nombre_seccion = "TOTAL_VOTOS"
        filename = f"{nombre_seccion}_{ajuste}_{acta_id}_{timestamp}.png"
        full_path = os.path.join(BASE_DIR, filename)

        cv2.imwrite(full_path, imagen)

        archivo_id = upload_file_to_dir_process_acta(
            full_path,
            cod_usuario,
            centro_computo
        )

        struct_archivos["total_votos"].append(archivo_id)

        if ctx:
            ctx.add_temp_file(full_path)
    for item in resultados:
        if item["tipo"] != "preferenciales":
            continue

        imagen = item["imagen"]

        rec_loader = ImageFromMemory(imagen, rotate=False)
        processor = VotesPrefImageProcessor(rec_loader)

        num_columns = get_cantidad_columnas_preferenciales(acta_id, constantes.QUEUE_LOGGER_VALUE_STAE)

        archivos_columnas = processor._procesar_columnas_preferenciales_stae_vd(
            acta_pk=acta_id,
            num_columns=num_columns,
            cod_usuario=cod_usuario,
            centro_computo=centro_computo,
            copia_a_color=False
        )

        struct_archivos["preferenciales"].extend(archivos_columnas)

    return struct_archivos

def orden_grupo(key):
    tipo, ajuste = key

    if tipo == "total_votos" and ajuste == "shift_left":
        return 0
    if tipo == "total_votos" and ajuste == "original":
        return 1
    if tipo == "preferenciales" and ajuste == "shift_left":
        return 2
    return 3


def crear_imagenes_recortes_stae_vd(img_limpia_paths, coords_finales):
    """
    Genera imágenes numpy de recortes STAE.
    Soporta N hojas.
    """
    _validar_paths(img_limpia_paths)
    imgs_base = _cargar_imagenes(img_limpia_paths)
    grupos = _agrupar_cortes(coords_finales)

    resultados = []
    for (tipo, ajuste) in _ordenar_grupos(grupos):
        imagen_final = _procesar_grupo(grupos[(tipo, ajuste)], imgs_base)
        if imagen_final is not None:
            resultados.append({
                "tipo": tipo,
                "ajuste": ajuste,
                "imagen": imagen_final
            })

    return resultados

def _validar_paths(paths):
    if not isinstance(paths, list):
        raise TypeError("img_limpia_paths debe ser una lista")
    if not paths:
        raise ValueError("img_limpia_paths no puede estar vacía")
    for path in paths:
        if not os.path.exists(path):
            raise FileNotFoundError(f"No existe la imagen: {path}")


def _cargar_imagenes(paths):
    imgs = {}
    for idx, path in enumerate(paths):
        img = cv2.imread(path)
        if img is None:
            raise RuntimeError(f"No se pudo leer la imagen: {path}")
        imgs[idx] = img
    return imgs


def _agrupar_cortes(coords_finales):
    grupos = {}
    for corte in coords_finales:
        tipo = "total_votos" if corte["seccion"].startswith("totales") else "preferenciales"
        key = (tipo, corte["ajuste"])
        grupos.setdefault(key, []).append(corte)
    return grupos

def _ordenar_grupos(grupos):
    return sorted(grupos.keys(), key=orden_grupo)

def _procesar_grupo(cortes, imgs_base):
    cortes = sorted(cortes, key=lambda c: c["seccion"])
    imagenes_por_hoja = {}

    for corte in cortes:
        recorte = _extraer_recorte(corte, imgs_base)
        if recorte is not None:
            imagenes_por_hoja.setdefault(corte["hoja_idx"], []).append(recorte)

    imagenes = _combinar_por_hoja(imagenes_por_hoja)
    return _apilar_imagenes(imagenes)

def _extraer_recorte(corte, imgs_base):
    img_base = imgs_base[corte["hoja_idx"]]
    (x1, y1), _, _, (x2, y2) = corte["coords"]
    recorte = img_base[y1:y2, x1:x2]
    return recorte if recorte.size else None

def _combinar_por_hoja(imagenes_por_hoja):
    imagenes = []
    hojas_ordenadas = sorted(imagenes_por_hoja.keys())
    total_hojas = len(hojas_ordenadas)
    for pos, hoja_idx in enumerate(hojas_ordenadas):
        recs = imagenes_por_hoja[hoja_idx]
        img = recs[0] if len(recs) == 1 else np.vstack(recs)
        img = ajustar_margenes_verticales(
            img,
            pos=pos,
            total=total_hojas,
            margen=8
        )
        imagenes.append(img)
    return imagenes


def _apilar_imagenes(imagenes):
    if not imagenes:
        return None

    max_width = max(img.shape[1] for img in imagenes)
    imagenes = [
        cv2.copyMakeBorder(
            img, 0, 0, 0, max_width - img.shape[1],
            cv2.BORDER_CONSTANT, value=(255, 255, 255)
        ) if img.shape[1] < max_width else img
        for img in imagenes
    ]
    return imagenes[0] if len(imagenes) == 1 else np.vstack(imagenes)

def ajustar_margenes_verticales(recorte, pos, total, margen=8):
    h = recorte.shape[0]
    top = 0
    bottom = h
    if total == 1:
        return recorte
    if pos == 0:
        bottom -= margen
    elif pos == total - 1:
        top += margen
    else:
        top += margen
        bottom -= margen
    if top >= bottom:
        return recorte
    return recorte[top:bottom, :]

def construir_json_votos_stae_vd(file_ids):
    """
    file_ids: List[int]
    """
    body_item = {"nro": 1}

    for idx, file_id in enumerate(file_ids, start=1):
        body_item[f"votos_{idx}"] = {
            "file": file_id
        }

    return {
        "body": [body_item],
        "headers": [""]
    }


def procesar_secciones_control_calidad(
    tipo_acta,
    codigo_eleccion,
    lista_filepaths,
    acta_id,
    cod_usuario,
    centro_computo
):
    num_candidatos = 0
    is_convencional = constantes.FLUJO_STAE

    if not isinstance(lista_filepaths, list):
        raise TypeError("lista_filepaths debe ser una lista")

    if len(lista_filepaths) == 0:
        raise ValueError("lista_filepaths no puede estar vacía")

    output_paths, cortes = procesar_marcadores_stae_vd(
        codigo_eleccion,
        tipo_acta,
        lista_filepaths,
        num_candidatos,
        is_convencional
    )

    resultados = crear_imagenes_recortes_stae_vd(
        output_paths,
        cortes
    )

    struct_archivos = cortar_imagenes_control_calidad(
        resultados,
        acta_id,
        cod_usuario,
        centro_computo
    )

    if struct_archivos.get("total_votos"):
        json_totales = construir_json_votos_stae_vd(
            struct_archivos["total_votos"]
        )
        insert_json_votos_by_abreviatura(
            acta_id,
            codigo_eleccion,
            tipo_acta,
            constantes.ABREV_CONTROL_CALIDAD_TOTAL_VOTOS,
            json_totales,
            log_queue=constantes.QUEUE_LOGGER_VALUE_STAE
        )
    if struct_archivos.get("preferenciales"):
        json_pref = construir_json_votos_stae_vd(
            struct_archivos["preferenciales"]
        )
        insert_json_votos_by_abreviatura(
            acta_id,
            codigo_eleccion,
            tipo_acta,
            constantes.ABREV_CONTROL_CALIDAD_TOTAL_VOTOS_PREFERENCIALES,
            json_pref,
            log_queue=constantes.QUEUE_LOGGER_VALUE_STAE
        )

    for path in output_paths:
        if os.path.exists(path):
            os.remove(path)



def _process_rectangles_stae_vd(rectangle, rec_id, acta_id, codigo_eleccion, tipo_acta, 
                                config_map, need_rotate, centro_computo, cod_usuario):
    section_name = config_map[rec_id].lower().replace(" ", "_")
    final_name, temp_name = generate_file_names(section_name)
    temp_path = os.path.join(os.path.dirname(final_name), temp_name)
    save_and_prepare_image(rectangle, final_name, temp_path)

    name = final_name

    archive_doc_id = _save_rotated_image(tipo_acta, codigo_eleccion, final_name, section_name, centro_computo, cod_usuario, is_convencional=constantes.FLUJO_STAE)

    params_stae_vd = SectionStaeVdParams(
        rectangle=rectangle,
        name=name,
        rec_id=rec_id,
        codigo_eleccion=codigo_eleccion,
        need_rotate=need_rotate,
        acta_type=tipo_acta,
        acta_id=acta_id,
        eleccion_id=codigo_eleccion,
        centro_computo=centro_computo,
        cod_usuario=cod_usuario
    )
    data = process_section_stae_vd(params_stae_vd)
    insert_det_acta_rectangulo(acta_id, codigo_eleccion, tipo_acta, archive_doc_id, data, constantes.QUEUE_LOGGER_VALUE_STAE)

    os.remove(final_name)

def process_section_stae_vd(params_stae_vd: SectionStaeVdParams) -> dict:
    data = {"n_seccion": params_stae_vd.rec_id}
    return data

def _procesar_escrutinio_stae_vd(acta_id, lista_filepaths, codigo_eleccion, tipo_acta, cod_usuario, centro_computo):
    
    resultados_rectangulos = _prepare_rectangles_stae_vd(lista_filepaths, codigo_eleccion, tipo_acta)
    need_rotate = False
    for bloque in ("principal", "segunda_hoja"):
        info = resultados_rectangulos.get(bloque)
        if not info:
            continue

        config_map = info["config_map"]
        rectangles = info["rectangles"]

        for rec_id, rectangle in rectangles:
            _process_rectangles_stae_vd(
                rectangle,
                rec_id,
                acta_id,
                codigo_eleccion,
                tipo_acta,
                config_map,
                need_rotate,
                centro_computo,
                cod_usuario
            )

    procesar_secciones_control_calidad(tipo_acta, codigo_eleccion, lista_filepaths, acta_id, cod_usuario, centro_computo)
    for file_path in lista_filepaths:
        if os.path.exists(file_path):
            os.remove(file_path)

def _procesar_instalacion_sufragio_stae_vd(
    acta_id,
    file_inst,
    file_sufr,
    codigo_eleccion,
    cod_usuario,
    centro_computo
):
    _procesar_archivo(
        file_inst,
        constantes.ABREV_ACTA_INSTALACION_STAE,
        acta_id,
        codigo_eleccion,
        cod_usuario,
        centro_computo
    )

    _procesar_archivo(
        file_sufr,
        constantes.ABREV_ACTA_SUFRAGIO_STAE,
        acta_id,
        codigo_eleccion,
        cod_usuario,
        centro_computo
    )


def _procesar_archivo(
    file_path,
    tipo_acta,
    acta_id,
    codigo_eleccion,
    cod_usuario,
    centro_computo
):
    if not file_path:
        return

    resultados = _prepare_rectangles_stae_vd(
        [file_path],
        codigo_eleccion,
        tipo_acta
    )

    for bloque in ("principal", "segunda_hoja"):
        info = resultados.get(bloque)
        if not info:
            continue

        for rec_id, rectangle in info["rectangles"]:
            _process_rectangles_stae_vd(
                rectangle,
                rec_id,
                acta_id,
                codigo_eleccion,
                tipo_acta,
                info["config_map"],
                False,
                centro_computo,
                cod_usuario
            )

    if os.path.exists(file_path):
        os.remove(file_path)


def pdf_to_aligned_images_stae_vd(
    ftp_uuid: str,
    *,
    dpi: int = 300,
    max_pages: int | None = None,
    is_convencional: str = constantes.FLUJO_STAE,
    log_queue=constantes.QUEUE_LOGGER_VALUE_STAE
):
    """
    Convierte un PDF a imágenes TIFF alineadas.
    
    Retorna:
    - lista de paths alineados (1 o más)
    """

    pdf_path = download_file_from_dir(
        ftp_uuid,
        log_queue=log_queue
    )

    images = convert_from_path(pdf_path=str(pdf_path),dpi=dpi,fmt="jpeg",thread_count=4)

    if max_pages:
        images = images[:max_pages]

    tiff_files = []

    for i, image in enumerate(images, start=1):
        tiff_name = f"{Path(ftp_uuid).stem}_page_{i}.tiff"

        image.save(
            tiff_name,
            format="TIFF",
            compression="tiff_lzw"
        )

        tiff_files.append(tiff_name)

    aligned_paths = []

    for tiff_path in tiff_files:
        aligned_path, _ = download_file_from_dir_and_align(
            tiff_path,
            acta_observada=False,
            is_convencional=is_convencional,
            use_working_dir=True,
            log_queue=log_queue
        )

        aligned_paths.append(aligned_path)

    if os.path.exists(pdf_path):
        os.remove(pdf_path)
    return aligned_paths

def _determinar_tipo_acta_stae(codigo_eleccion):
    if codigo_eleccion in [constantes.COD_ELEC_PRESIDENTE, constantes.COD_ELEC_SENADO_MULTIPLE]:
        tipo_acta = constantes.ABREV_ACTA_ESCRUTINIO_STAE
    else:
        tipo_acta = constantes.ABREV_ACTA_ESCRUTINIO_STAE_HORIZONTAL
    return tipo_acta

def process_acta_stae_vd(acta_id: int,cod_usuario: str,centro_computo: str):
    logger.info(f"Procesando Acta STAE con acta_id {acta_id}", queue = constantes.QUEUE_LOGGER_VALUE_STAE)
    if acta_id is None:
        logger.info("Proceso STAE VD cancelado: acta_id es NULL",queue=constantes.QUEUE_LOGGER_VALUE_STAE)
        return
    rows_deleted = delete_data_from_table(
                    "det_acta_rectangulo", "n_acta", acta_id,
                    log_queue = constantes.QUEUE_LOGGER_VALUE_STAE
                )
    logger.info(f"Registros de rectángulos eliminados: {rows_deleted}",queue=constantes.QUEUE_LOGGER_VALUE_STAE)
    with use_execution_context():

        acta = get_data_cab_acta(acta_id, constantes.QUEUE_LOGGER_VALUE_STAE)

        if not acta:
            logger.info(f"Proceso STAE cancelado: no se encontro cabecera de acta para acta_id {acta_id}",queue=constantes.QUEUE_LOGGER_VALUE_STAE)
            return

        fileid_1 = acta['n_archivo_escrutinio_pdf_firmado']
        fileid_2 = acta['n_archivo_instalacion_pdf_firmado']
        fileid_3 = acta['n_archivo_sufragio_pdf_firmado']

        if not fileid_1 or not fileid_2 or not fileid_3:
            logger.info(f"Proceso STAE cancelado para acta_id {acta_id}: PDFs faltantes (escrutinio={fileid_1}, instalacion={fileid_2}, sufragio={fileid_3})",
                        queue=constantes.QUEUE_LOGGER_VALUE_STAE)
            return

        ftp_uuid_1 = get_nombre_by_archivo_pk(fileid_1, constantes.QUEUE_LOGGER_VALUE_STAE)
        ftp_uuid_2 = get_nombre_by_archivo_pk(fileid_2, constantes.QUEUE_LOGGER_VALUE_STAE)
        ftp_uuid_3 = get_nombre_by_archivo_pk(fileid_3, constantes.QUEUE_LOGGER_VALUE_STAE)

        ubigeo_eleccion = get_data_det_ubigeo_eleccion(acta['n_det_ubigeo_eleccion'], constantes.QUEUE_LOGGER_VALUE_STAE)
        eleccion = get_data_mae_eleccion(ubigeo_eleccion['n_eleccion'], constantes.QUEUE_LOGGER_VALUE_STAE)
        
        codigo_eleccion = eleccion['c_codigo']

        tipo_acta_escrutinio = _determinar_tipo_acta_stae(codigo_eleccion)

        lista_imgs_escrutinio = pdf_to_aligned_images_stae_vd(ftp_uuid_1,log_queue=constantes.QUEUE_LOGGER_VALUE_STAE)

        _procesar_escrutinio_stae_vd(acta_id,lista_imgs_escrutinio,codigo_eleccion,tipo_acta_escrutinio,cod_usuario,centro_computo)

        file_inst = pdf_to_aligned_images_stae_vd(ftp_uuid_2,max_pages=1,log_queue=constantes.QUEUE_LOGGER_VALUE_STAE)[0]
        file_sufr = pdf_to_aligned_images_stae_vd(ftp_uuid_3,max_pages=1,log_queue=constantes.QUEUE_LOGGER_VALUE_STAE)[0]

        _procesar_instalacion_sufragio_stae_vd(acta_id, file_inst, file_sufr, codigo_eleccion,cod_usuario,centro_computo)

        _registrar_accion_final(acta_id, cod_usuario, centro_computo, log_queue=constantes.QUEUE_LOGGER_VALUE_STAE)
        logger.info(f"Finalizo Acta STAE con acta_id {acta_id}", queue = constantes.QUEUE_LOGGER_VALUE_STAE)

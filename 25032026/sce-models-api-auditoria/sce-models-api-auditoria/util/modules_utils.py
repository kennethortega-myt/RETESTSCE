from db.progress import get_data_tab_mesa, get_data_det_ubigeo_eleccion, get_data_mae_eleccion, get_data_mae_ubigeo, get_data_det_distrito_electoral_eleccion
from models.actasmodel import ActaReferencePoints, extract_rectangles
from models.imageutils import ImageFromDisk
from models.votesprocessor import VotesImageProcessor
from models.votesprefprocesor import VotesPrefImageProcessor
from models.tipo_acta import CONFIGURACION_ELECCION
from db.progress import get_coordenadas_por_eleccion_documento_electoral, get_valor_copia_a_color
from models.tipo_acta import TipoActa
from util import constantes
import cv2
import os
import traceback
from logger_config import logger

def obtener_contexto(acta, log_queue):
    tab_mesa = get_data_tab_mesa(acta['n_mesa'], log_queue)
    ubigeo_eleccion = get_data_det_ubigeo_eleccion(acta['n_det_ubigeo_eleccion'], log_queue)
    eleccion = get_data_mae_eleccion(ubigeo_eleccion['n_eleccion'], log_queue)
    ubigeo = get_data_mae_ubigeo(ubigeo_eleccion['n_ubigeo'], log_queue)
    tipo_hoja_stae = acta['n_tipo_transmision']
    return eleccion, ubigeo, tab_mesa, tipo_hoja_stae

def obtener_cantidad_candidatos(eleccion, ubigeo):
    if eleccion['c_codigo'] in [constantes.COD_ELEC_DIPUTADO, constantes.COD_ELEC_SENADO_MULTIPLE]:
        return get_data_det_distrito_electoral_eleccion(ubigeo['n_distrito_electoral'], eleccion['n_eleccion_pk'])
    return 0

def determinar_tipo_acta(codigo, is_stae, tipo_hoja_stae, cantidad_candidatos):
    if codigo == constantes.COD_ELEC_DIPUTADO:
        tipo_acta = _determinar_acta_diputado(is_stae, tipo_hoja_stae, cantidad_candidatos)
    elif codigo == constantes.COD_ELEC_SENADO_UNICO:
        tipo_acta = _determinar_acta_senado_unico(is_stae, tipo_hoja_stae)
    elif codigo == constantes.COD_ELEC_PARLAMENTO:
        tipo_acta = _determinar_acta_parlamento(is_stae, tipo_hoja_stae)
    elif codigo == constantes.COD_ELEC_SENADO_MULTIPLE:
        tipo_acta = _determinar_acta_senado_multiple(is_stae, tipo_hoja_stae)
    elif codigo in [constantes.COD_ELEC_PRESIDENTE, constantes.COD_ELEC_REVOCATORIA, constantes.COD_ELEC_DISTRITAL]:
        tipo_acta = _determinar_acta_generica(is_stae, tipo_hoja_stae)
    else:
        tipo_acta = None
    return tipo_acta

def ajustar_acta_por_convencional(tipo_acta, is_convencional):
    if is_convencional == constantes.FLUJO_CONVENCIONAL or not tipo_acta:
        return tipo_acta

    reemplazos = {
        constantes.ABREV_ACTA_ESCRUTINIO:
            constantes.ABREV_ACTA_ESCRUTINIO_EXTRANJERO,
        constantes.ABREV_ACTA_ESCRUTINIO_HORIZONTAL:
            constantes.ABREV_ACTA_ESCRUTINIO_HORIZONTAL_EXTRANJERO,
    }

    return reemplazos.get(tipo_acta, tipo_acta)

def _determinar_acta_diputado(is_stae, tipo_hoja_stae, cantidad_candidatos):
    if is_stae and tipo_hoja_stae:
        if tipo_hoja_stae == constantes.TIPO_HOJA_CONTINGENCIA_A3:
            return constantes.ABREV_ACTA_ESCRUTINIO_HORIZONTAL if cantidad_candidatos > 16 else constantes.ABREV_ACTA_ESCRUTINIO
        elif tipo_hoja_stae in [constantes.TIPO_HOJA_STAE_TRANSMITIDA_A4, constantes.TIPO_HOJA_STAE_NO_TRANSMITIDA_A4]:
            return constantes.ABREV_ACTA_ESCRUTINIO_STAE_HORIZONTAL if cantidad_candidatos > 8 else constantes.ABREV_ACTA_ESCRUTINIO_STAE
    else:
        return constantes.ABREV_ACTA_ESCRUTINIO_HORIZONTAL if cantidad_candidatos > 16 else constantes.ABREV_ACTA_ESCRUTINIO
    return None


def _determinar_acta_senado_unico(is_stae, tipo_hoja_stae):
    if is_stae and tipo_hoja_stae:
        if tipo_hoja_stae == constantes.TIPO_HOJA_CONTINGENCIA_A3:
            return constantes.ABREV_ACTA_ESCRUTINIO_HORIZONTAL
        elif tipo_hoja_stae in [constantes.TIPO_HOJA_STAE_TRANSMITIDA_A4, constantes.TIPO_HOJA_STAE_NO_TRANSMITIDA_A4]:
            return constantes.ABREV_ACTA_ESCRUTINIO_STAE_HORIZONTAL
    else:
        return constantes.ABREV_ACTA_ESCRUTINIO_HORIZONTAL
    return None


def _determinar_acta_parlamento(is_stae, tipo_hoja_stae):
    if is_stae and tipo_hoja_stae:
        if tipo_hoja_stae == constantes.TIPO_HOJA_CONTINGENCIA_A3:
            return constantes.ABREV_ACTA_ESCRUTINIO
        elif tipo_hoja_stae in [constantes.TIPO_HOJA_STAE_TRANSMITIDA_A4, constantes.TIPO_HOJA_STAE_NO_TRANSMITIDA_A4]:
            return constantes.ABREV_ACTA_ESCRUTINIO_STAE_HORIZONTAL
    else:
        return constantes.ABREV_ACTA_ESCRUTINIO
    return None

def _determinar_acta_senado_multiple(is_stae, tipo_hoja_stae):
    if is_stae and tipo_hoja_stae:
        if tipo_hoja_stae == constantes.TIPO_HOJA_CONTINGENCIA_A3:
            return constantes.ABREV_ACTA_ESCRUTINIO
        elif tipo_hoja_stae in [constantes.TIPO_HOJA_STAE_TRANSMITIDA_A4, constantes.TIPO_HOJA_STAE_NO_TRANSMITIDA_A4]:
            return constantes.ABREV_ACTA_ESCRUTINIO_STAE
    else:
        return constantes.ABREV_ACTA_ESCRUTINIO
    return None


def _determinar_acta_generica(is_stae, tipo_hoja_stae):
    if is_stae and tipo_hoja_stae:
        if tipo_hoja_stae == constantes.TIPO_HOJA_CONTINGENCIA_A3:
            return constantes.ABREV_ACTA_ESCRUTINIO
        elif tipo_hoja_stae in [constantes.TIPO_HOJA_STAE_TRANSMITIDA_A4, constantes.TIPO_HOJA_STAE_NO_TRANSMITIDA_A4]:
            return constantes.ABREV_ACTA_ESCRUTINIO_STAE
    else:
        return constantes.ABREV_ACTA_ESCRUTINIO
    return None


def validate_acta(source_fle, codigo_eleccion : str, codigo_tipo_acta : int, n_acta_pk: str, cantidad_candidatos : int, acta_tipo_disenio: str,
                  is_convencional: str):
  try:
    tipo_acta = TipoActa(codigo_eleccion, codigo_tipo_acta, cantidad_candidatos, acta_tipo_disenio)
    image_loader = ImageFromDisk(source_fle, constantes.QUEUE_LOGGER_VALUE_VALIDATE)
    acta_reference_points = ActaReferencePoints(image_loader, tipo_acta, is_convencional=is_convencional)
    marcador_error_msg = ""
    if codigo_tipo_acta == 2: # Acta escrutinio
      try:
        acta_reference_points.validar_marcadores_all(is_convencional, log_queue = constantes.QUEUE_LOGGER_VALUE_VALIDATE)
      except Exception as e:
        marcador_error_msg = f"{e}"
      if marcador_error_msg != "":
        try:
            # Verificar integridad de los votos y preferenciales de las actas
            error_pref, error_votos = validar_integridad_acta(image_loader, n_acta_pk, acta_reference_points, codigo_eleccion, acta_tipo_disenio, True, is_convencional) # new
            logger.info(f"VALORES DE INTEGRIDAD DE LA TABLA: tabla total = {not error_votos}, tabla preferencial(si lo tiene) = {not error_pref}", queue = constantes.QUEUE_LOGGER_VALUE_VALIDATE)
            
            mensaje_error = {
                (True, False): constantes.MENSAJE_VALIDACION_TABLA_PREFERENCIAL,
                (False, True): constantes.MENSAJE_VALIDACION_TABLA_VOTOS,
                (True, True): constantes.MENSAJE_VALIDACION_TABLAS_AMBOS
            }.get((error_pref, error_votos), "")
            
            if mensaje_error:
                return mensaje_error
            else:
                return marcador_error_msg
        except Exception as e:
            logger.info(f"Error en validacion de la integridad de la tabla para acta observada: {e}", queue = constantes.QUEUE_LOGGER_VALUE_VALIDATE)
            traceback.print_exc()
    elif codigo_tipo_acta == 3: # Acta instalación
      acta_reference_points.get_squares_normal(is_convencional=is_convencional, log_queue = constantes.QUEUE_LOGGER_VALUE_VALIDATE)
    return "ok"
  except Exception as e:
    return str(e)


def extract_rectangles_digitization(source_file, rectangles, acta_observada, is_convencional, square_coords, process_type = True):
  logger.info("Empieza el metodo de extraccion de rectangulo...", queue = constantes.QUEUE_LOGGER_VALUE_VALIDATE)
  if process_type ==True:
    rectangles = [(
      x['section']['id'],
      (x['topLeft']['x'], x['topLeft']['y']),
      (x['bottomRight']['x'], x['bottomRight']['y'])
    ) for x in rectangles]

  logger.info(f"source_file extract_rectangles: {source_file}", queue = constantes.QUEUE_LOGGER_VALUE_VALIDATE)
  image_loader = ImageFromDisk(source_file, constantes.QUEUE_LOGGER_VALUE_VALIDATE)
  return extract_rectangles(image_loader, rectangles, acta_observada, is_convencional, square_coords, acta_type = None, codigo_eleccion = None, log_queue=constantes.QUEUE_LOGGER_VALUE_VALIDATE)


def _prepare_rectangles_digitization(file1_path, acta_observada, is_convencional, eleccion_id, acta_type, square_coords):
  logger.info("Empieza el metodo de preparacion de rectangulos para el acta observada...", queue = constantes.QUEUE_LOGGER_VALUE_VALIDATE)
  datos = get_coordenadas_por_eleccion_documento_electoral(eleccion_id, acta_type, log_queue=constantes.QUEUE_LOGGER_VALUE_VALIDATE)
  config_map = {datos[key][0]: datos[key][1] for key in datos}
  rectangles = [
    (datos[key][1],
     (float(datos[key][2]), float(datos[key][4])),
     (float(datos[key][3]), float(datos[key][5])))
    for key in datos
  ]
  rectangles = extract_rectangles_digitization(file1_path, rectangles, acta_observada, is_convencional, square_coords, process_type=False)
  return config_map, rectangles
  

def validar_integridad_acta(image_loader, n_acta_pk, acta_reference_points, eleccion_id, acta_type, acta_observada, is_convencional):
    """
    Verifica la integridad de los votos y preferenciales de las actas
    Args:
        image_loader: ImageFromDisk
        n_acta_pk: int
        acta_reference_points: ActaReferencePoints
        eleccion_id: int
        acta_type: str
        acta_observada: bool
    Returns:
        error_pref: bool
        error_votos: bool
    """
    flag_pref = True
    flag_votos = True
    valor_str = get_valor_copia_a_color(log_queue=constantes.QUEUE_LOGGER_VALUE_VALIDATE)
    copia_a_color = valor_str.lower() == 'true'
    logger.info("Empieza la validacion de integridad de la tabla...", queue = constantes.QUEUE_LOGGER_VALUE_VALIDATE)
    img_rotated_path = './img_rotated.png'

    img_rotated, marcadores_esquinas = acta_reference_points.align_image_with_squares_observada(image_loader, is_convencional, log_queue = constantes.QUEUE_LOGGER_VALUE_VALIDATE)
    cv2.imwrite(img_rotated_path, img_rotated)
    rectangles = _prepare_rectangles_digitization(img_rotated_path, acta_observada, is_convencional, eleccion_id, acta_type, marcadores_esquinas)
    rotar_corte = True if acta_type in [constantes.ABREV_ACTA_ESCRUTINIO_HORIZONTAL, constantes.ABREV_ACTA_ESCRUTINIO_STAE_HORIZONTAL, constantes.ABREV_ACTA_ESCRUTINIO_HORIZONTAL_EXTRANJERO] else False
    for values in rectangles[1]:
        codigo_eleccion = values[0]
        if codigo_eleccion in ['VOTO_AE', 'VOTO_PRE_AE']:
            img = values[1]
            if rotar_corte:
                img = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)
            cv2.imwrite(f'./region_img_{codigo_eleccion}.png', img)

    config = CONFIGURACION_ELECCION.get(eleccion_id, {})

    if "preferenciales" in config:
        pref_image_path = './region_img_VOTO_PRE_AE.png'
        pref_image_loader = ImageFromDisk(pref_image_path, constantes.QUEUE_LOGGER_VALUE_VALIDATE)
        _, _, flag_pref, _, _, _ = VotesPrefImageProcessor(pref_image_loader).get_data_cortes_preferencial_observada(
                n_acta_pk, "voto_preferencial", cod_usuario="", centro_computo="", copia_a_color=copia_a_color, is_convencional=is_convencional, digitization_mode=True, log_queue=constantes.QUEUE_LOGGER_VALUE_VALIDATE
            )
        os.remove(pref_image_path)
        if flag_pref:
            logger.info("ERROR: No hay suficientes filas o columnas detectadas en la preferencial.", queue = constantes.QUEUE_LOGGER_VALUE_VALIDATE)
        else:
            logger.info("OK: Suficientes filas y columnas detectadas en la preferencial.", queue = constantes.QUEUE_LOGGER_VALUE_VALIDATE)
    else:
        flag_pref = False

    votos_image_path = './region_img_VOTO_AE.png'
    votos_image_loader = ImageFromDisk(votos_image_path, constantes.QUEUE_LOGGER_VALUE_VALIDATE)
    _, _, flag_votos, _, _, _ = VotesImageProcessor(votos_image_loader).get_data_cortes_observada(
            n_acta_pk, "votos_por_agrupación_política", eleccion_id, acta_type, cod_usuario="", centro_computo="", copia_a_color=copia_a_color, is_convencional=is_convencional, 
            digitization_mode=True,
            log_queue=constantes.QUEUE_LOGGER_VALUE_VALIDATE
        )
    os.remove(votos_image_path)
    if flag_votos:
        logger.info("ERROR: No hay suficientes filas o columnas detectadas en los votos.", queue = constantes.QUEUE_LOGGER_VALUE_VALIDATE)
    else:
        logger.info("OK: Suficientes filas y columnas detectadas en los votos.", queue = constantes.QUEUE_LOGGER_VALUE_VALIDATE)

    os.remove(img_rotated_path)
    return flag_pref, flag_votos


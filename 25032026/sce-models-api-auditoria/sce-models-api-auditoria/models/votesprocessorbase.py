import numpy as np
from models.imageutils import ImagesCache, ImagesLoader, cache_result
import cv2
from db.progress import upload_file_to_dir_process_acta
import os
from logger_config import logger
from datetime import datetime
import json
import math
from util import constantes
from util.imagen_util import mascara_dinamica
from db.execution_context import get_context, resolve_workspace_path

config_get_table_dict = {
    "cuadricula_votos": {
        "min_line_length": 100,#100
        "first_threshold": 25,#125
        "second_threshold":50,#50
        "space_between_points": 5,#3
        "min_thickness": 1,#1
        "max_line_gap":10#15
    },
    "total_votos": {
        "min_line_length": 130,
        "first_threshold": 75,
        "second_threshold":100,
        "space_between_points": 3,
        "min_thickness": 1,
        "max_line_gap":100
    },
    "preferenciales": {
        "min_line_length": 150,
        "first_threshold": 100,
        "second_threshold":125,
        "space_between_points": 2.9,
        "min_thickness": 1,
        "max_line_gap":100
    },
    "firma": {
        "min_line_length": 80,#100
        "first_threshold": 40,#55
        "second_threshold":100,
        "space_between_points": 5,#1
        "min_thickness": 1,
        "max_line_gap":100
    },
    "cvas":{
        "min_line_length": 15,#25
        "first_threshold": 15,#25
        "second_threshold":75,#75
        "space_between_points": 5,
        "min_thickness": 1,
        "max_line_gap":100
    },
    "otro": {
        "min_line_length": 300,
        "first_threshold": 150,
        "second_threshold":150,
        "space_between_points": 5,
        "min_thickness": 1,
        "max_line_gap":100
    },
    "obs_lista_electores": {
        "min_line_length": 50,
        "first_threshold": 40,
        "second_threshold":100,
        "space_between_points": 3,
        "min_thickness": 1,
        "max_line_gap":100
    },
}

class VotesProcessorBase(ImagesCache):
    def __init__(self, image_loader: ImagesLoader):
        super().__init__()
        self.image_loader = image_loader

    def _process_grilla_preferencial(self, img_crop, new_img_preprocess, matriz_detec):
        filas = len(matriz_detec) - 1
        columnas = len(matriz_detec[0]) - 1

        ans = [[] for _ in range(filas)]
        ans_preprocess = [[] for _ in range(filas)]
        info = [[] for _ in range(filas)]

        for i in range(filas):
            for j in range(columnas):
                tl = matriz_detec[i][j]
                tr = matriz_detec[i][j + 1]
                bl = matriz_detec[i + 1][j]
                br = matriz_detec[i + 1][j + 1]

                x1 = min(tl[0], bl[0])
                x2 = max(tr[0], br[0])
                y1 = min(tl[1], tr[1])
                y2 = max(bl[1], br[1])

                px = 5
                py = 5
                x1m = x1 - px
                y1m = y1 - py
                x2m = x2 + px + 1
                y2m = y2 + py + 1

                x1m = max(0, x1m)
                y1m = max(0, y1m)

                tmp = img_crop[y1m:y2m, x1m:x2m]
                tmp_2 = new_img_preprocess[y1m:y2m, x1m:x2m]
                if tmp.size == 0:
                    tmp = img_crop[y1:y2, x1:x2]
                    tmp_2 = new_img_preprocess[y1:y2, x1:x2]

                ans[i].append(tmp)
                ans_preprocess[i].append(tmp_2)
                info[i].append((x1m, y1m, x2m, y2m))
        return ans, ans_preprocess, info

    def _build_table_image(self, img_limpia_path, point0, point3):
        img_limpia = cv2.imread(img_limpia_path)
        return img_limpia[point0[1]:point3[1], point0[0]:point3[0]]
    
    def _fix_points(self, point0, point3, pad=8):
        return (point0[0]+pad, point0[1]+pad), (point3[0]-pad, point3[1]-pad)

    def cortar_imagenes_total_votos(self, img_limpia_path, point0, point3, acta_id, nombre_seccion, tipo_corte, cod_usuario, centro_computo):
        # Registrar archivo temporal en contexto
        ctx = get_context()
        imagen_corte = self._build_table_image(img_limpia_path, point0, point3)

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S%f')
        archivos_subidos = []
        filename = f"{nombre_seccion}_{tipo_corte}_{acta_id}_{timestamp}.png"
        full_path = resolve_workspace_path(filename)
        cv2.imwrite(full_path, imagen_corte)
        archivo_id = upload_file_to_dir_process_acta(full_path, cod_usuario, centro_computo)
        archivos_subidos.append(archivo_id)
        if ctx:
            ctx.add_temp_file(full_path)

        return archivos_subidos

    @staticmethod
    def compute_intersection(line1, line2):
        line1_p0, line1_p1 = np.array(line1, dtype='float64')
        line2_p0, line2_p1 = np.array(line2, dtype='float64')

        v1 = line1_p1 - line1_p0
        v2 = line2_p1 - line2_p0
        v0 = line2_p0 - line1_p0

        v2_ort = VotesProcessorBase.ort(v2)

        den = np.dot(v1, v2_ort)
        num = np.dot(v0, v2_ort)
        return np.array(line1_p0 + v1 * (num / den), dtype='int32')

    @staticmethod
    def ort(point):
        return np.array((-point[1], point[0]))

    def estimate_line_thickness(self, image: np.ndarray, x0, y0, x1, y1, sample_length=5) -> float:
        """
        Estima el grosor de una linea en la imagen binaria usando perfiles perpendiculares.
        """
        dx = x1 - x0
        dy = y1 - y0
        length = math.hypot(dx, dy)
        if length == 0:
            return 0
        nx = -dy / length
        ny = dx / length

        # Punto medio
        mx = int((x0 + x1) / 2)
        my = int((y0 + y1) / 2)

        # Tomar un perfil perpendicular
        thickness = 0
        for i in range(-sample_length, sample_length + 1):
            px = int(mx + nx * i)
            py = int(my + ny * i)
            if 0 <= px < image.shape[1] and 0 <= py < image.shape[0]:
                if image[py, px] > 0:
                    thickness += 1
        return thickness

    def average_line(self, group_lines):
        """
        Metodo donde cada grupo produce una sola linea “fusionada”, 
        que sigue la inclinacion real de las lineas detectadas, en lugar de obligarlas a ser rectas.
        """
        xs = [p[0] for ln in group_lines for p in ln]
        ys = [p[1] for ln in group_lines for p in ln]

        min_x, max_x = min(xs), max(xs)
        min_y, max_y = min(ys), max(ys)
        pts = np.array([[x,y] for x,y in zip(xs,ys)])
        vx, vy, cx, cy = cv2.fitLine(pts, cv2.DIST_L2, 0, 0.01, 0.01)
        vx, vy, cx, cy = float(vx), float(vy), float(cx), float(cy)
        if abs(vx) > abs(vy):
            x0, x1 = min_x, max_x
            y0 = int(cy + (x0 - cx) * (vy/vx))
            y1 = int(cy + (x1 - cx) * (vy/vx))
        else:
            y0, y1 = min_y, max_y
            x0 = int(cx + (y0 - cy) * (vx/vy))
            x1 = int(cx + (y1 - cy) * (vx/vy))
        return (int(x0), int(y0)), (int(x1), int(y1))

    def _normalize_lines(self, lines):
        """Normaliza diferentes representaciones de lineas a ((x0,y0),(x1,y1))."""
        norm_lines = []
        for ln in lines:
            if isinstance(ln, (list, tuple)) and len(ln) == 2 and len(ln[0]) == 2:
                norm_lines.append((tuple(map(int, ln[0])), tuple(map(int, ln[1]))))
            elif isinstance(ln, (list, tuple)) and len(ln) == 4:
                norm_lines.append(((int(ln[0]), int(ln[1])), (int(ln[2]), int(ln[3]))))
            elif isinstance(ln, np.ndarray) and ln.size == 4:
                a = ln.flatten()
                norm_lines.append(((int(a[0]), int(a[1])), (int(a[2]), int(a[3]))))
            else:
                try:
                    x0, y0 = int(ln[0][0]), int(ln[0][1])
                    x1, y1 = int(ln[1][0]), int(ln[1][1])
                    norm_lines.append(((x0, y0), (x1, y1)))
                except (TypeError, IndexError, ValueError):
                    continue
        return norm_lines


    def _group_lines(self, sorted_lines, idx, group_sep_threshold):
        """Agrupa lineas cercanas y devuelve una lista de grupos de indices."""
        groups, current_group = [], [0]
        prev = sorted_lines[0][0][idx]

        for i, line in enumerate(sorted_lines[1:], start=1):
            cur = line[0][idx]
            if cur - prev < group_sep_threshold:
                current_group.append(i)
            else:
                groups.append(current_group)
                current_group = [i]
            prev = cur

        groups.append(current_group)
        return groups


    def _select_best_line(self, sorted_lines, group):
        """Devuelve la linea promedio del grupo, ponderada por longitud."""
        _, best_len = None, 0
        for i in group:
            line = sorted_lines[i]
            dx, dy = line[1][0] - line[0][0], line[1][1] - line[0][1]
            delta = math.hypot(dx, dy)
            if delta > best_len:
                _, best_len = line, delta
        return self.average_line([sorted_lines[i] for i in group])


    def _filter_by_distance(self, ans, idx):
        """Elimina última línea si está demasiado cerca de la penúltima."""
        if len(ans) < 2:
            return ans
        dist_mean = np.mean([ans[i][0][idx] - ans[i - 1][0][idx] for i in range(1, len(ans))])
        if ans[-1][0][idx] - ans[-2][0][idx] < dist_mean / 2.5:
            ans.pop()
        return ans


    def get_best_lines(self, lines, idx=1, check_dist=False, group_sep_threshold=10):
        """
        Selecciona una sola línea representativa por grupo de líneas cercanas.
        Usa longitud real del segmento y promedio de grupo para mejorar alineación.
        """
        if not lines:
            return []

        norm_lines = self._normalize_lines(lines)
        sorted_lines = sorted(norm_lines, key=lambda x: x[0][idx])

        groups = self._group_lines(sorted_lines, idx, group_sep_threshold)
        ans = [self._select_best_line(sorted_lines, g) for g in groups]

        return self._filter_by_distance(ans, idx) if check_dist else ans


    def get_image_rect(self, p0, p1, p2, p3):
        """Extract from self.img a rectangle defined by the four points p0, p1, p2, p3"""
        width = int(np.linalg.norm(p0 - p1))
        height = int(np.linalg.norm(p3 - p0))
        src = np.array([p0, p1, p2, p3], dtype='float32')
        dst = np.array([[0, 0], [width, 0], [width, height], [0, height]], dtype='float32')
        mp = cv2.getPerspectiveTransform(src, dst)
        return cv2.warpPerspective(self.image_loader.get_image(), mp, (width, height))

    def compute_dynamic_threshold_extranjero(self, mean_val, mean_sat, max_sat):
        min_thr = 135
        max_thr = 155
        min_val = 220
        max_val = 245
        
        normalized = (mean_val - min_val) / (max_val - min_val)
        normalized = np.clip(normalized, 0, 1)
        thr_val = min_thr + normalized * (max_thr - min_thr)

        max_sat = float(max_sat)
        min_thr_sat = 145
        max_thr_sat = 155
        min_sat_range = 80
        max_sat_range = 110

        normalized_sat = (max_sat - min_sat_range) / (max_sat_range - min_sat_range)
        normalized_sat = np.clip(normalized_sat, 0, 1)
        thr_sat = min_thr_sat + normalized_sat * (max_thr_sat - min_thr_sat)

        thr = 0.7 * thr_val + 0.3 * thr_sat
        min_sat_adj = 10
        max_sat_adj = 25

        sat_norm = (mean_sat - min_sat_adj) / (max_sat_adj - min_sat_adj)
        sat_norm = np.clip(sat_norm, 0, 1)

        sat_adjust = -10 + sat_norm * 15

        thr += sat_adjust
        return int(np.clip(thr, 135, 155))

    def compute_dynamic_threshold(self, mean_val):
        min_thr = 115
        max_thr = 135
        min_val = 195
        max_val = 210

        normalized = (mean_val - min_val) / (max_val - min_val)
        normalized = np.clip(normalized, 0, 1)
        thr = min_thr + normalized * (max_thr - min_thr)
        return int(thr)

    @cache_result("get_fft_filtered")
    def get_fft_filtered(self, modo='otro', is_convencional=constantes.FLUJO_CONVENCIONAL, log_queue="default"):
        img = self.image_loader.get_image().astype(np.float32)
        f = np.fft.fft2(img)
        fshift = np.fft.fftshift(f)
        magnitude = np.abs(fshift)
        magnitude_spectrum = 20 * np.log(magnitude + 1e-8)
        mask = magnitude_spectrum > 300
        fshift[mask] = 0
        img_back = np.fft.ifft2(np.fft.ifftshift(fshift))
        img_back = np.real(img_back)
        img_back = cv2.normalize(img_back, None, 0, 255,norm_type=cv2.NORM_MINMAX,dtype=cv2.CV_32F)
        # Threshold
        if modo != "otro":
            hsv = cv2.cvtColor(img.astype(np.uint8), cv2.COLOR_BGR2HSV)
            mean_sat = np.mean(hsv[:, :, 1])
            mean_val = np.mean(hsv[:, :, 2])
            max_sat = np.max(hsv[:, :, 1])

            if is_convencional == constantes.FLUJO_CONVENCIONAL:
                black_threshold = self.compute_dynamic_threshold(mean_val)
            else:
                black_threshold = self.compute_dynamic_threshold_extranjero(mean_val, mean_sat, max_sat)
        else:
            black_threshold = 135
        return np.where(img_back < black_threshold, 0, 255).astype(np.uint8)

    def get_remove_small_dots(self, modo='otro', is_convencional = constantes.FLUJO_CONVENCIONAL, log_queue = "default"):
        img = self.get_fft_filtered(modo=modo, is_convencional=is_convencional, log_queue=log_queue)
        
        if modo != "otro":
            hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
            lower_blue = np.array([100, 50, 50])
            upper_blue = np.array([140, 255, 255])
            blue_mask = cv2.inRange(hsv, lower_blue, upper_blue)
            img[blue_mask > 0] = [255, 255, 255]  # Mascara azul

        gray_image = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        _, binary_map = cv2.threshold(gray_image, 240, 255, cv2.THRESH_BINARY_INV)
        nlabels, labels, stats, _ = cv2.connectedComponentsWithStats(binary_map, None, None, None, 8, cv2.CV_32S)
        areas = stats[1:, cv2.CC_STAT_AREA]
        result = np.zeros(labels.shape, np.uint8)

        for i in range(0, nlabels - 1):
            if areas[i] >= 100:
                result[labels == i + 1] = 255

        return result

    def get_table_points(self, modo='otro', is_convencional=constantes.FLUJO_CONVENCIONAL, log_queue = "default"):
        h_l, v_l = self.get_lines(modo, is_convencional, log_queue)
        ans = []
        for h_line in h_l:
            hp = []
            for v_line in v_l:
                hp.append(self.compute_intersection(h_line, v_line))

            if len(hp) > 0:
                ans.append(hp)
        return ans

    def get_data_tabla(self, modo='otro', is_convencional=constantes.FLUJO_CONVENCIONAL, log_queue = "default"):
        table_points = self.get_table_points(modo, is_convencional, log_queue)
        ans = []
        for i in range(1, len(table_points)):
            row = []
            p0 = table_points[i - 1][0]
            p3 = table_points[i][0]
            for j in range(1, len(table_points[i])):
                p1 = table_points[i - 1][j]
                p2 = table_points[i][j]
                row.append(self.get_image_rect(p0, p1, p2, p3))
                p0 = p1
                p3 = p2
            ans.append(row)

        table_points = [point for row in table_points for point in row]
        return [table_points[0], table_points[-1]]
    
    def get_lines(self, modo='otro', is_convencional=constantes.FLUJO_CONVENCIONAL, log_queue = "default"):
        table = self.get_table(modo, is_convencional=is_convencional, log_queue=log_queue)
        threshold = config_get_table_dict[modo]["second_threshold"]
        min_line_length = config_get_table_dict[modo]["min_line_length"]
        max_line_gap = config_get_table_dict[modo]["max_line_gap"]
        
        lines = cv2.HoughLinesP(table, 1, np.pi / 180, threshold, None, min_line_length, max_line_gap)
        horizontal_lines = []
        vertical_lines = []

        tolerance_deg = 2
        tolerance_rad = math.radians(tolerance_deg)

        if lines is not None:
            for line in lines:
                x0, y0, x1, y1 = line[0]
                pt0 = (x0, y0)
                pt1 = (x1, y1)
                theta = math.atan2(y1 - y0, x1 - x0)
                theta = abs(theta)

                if theta <= tolerance_rad or abs(theta - np.pi) <= tolerance_rad:
                    horizontal_lines.append((pt0, pt1))
                elif abs(theta - np.pi/2) <= tolerance_rad:
                    vertical_lines.append((pt0, pt1))

        hor = self.get_best_lines(horizontal_lines, idx=1, check_dist=False)
        ver = self.get_best_lines(vertical_lines, idx=0, check_dist=False)

        return hor, ver

    def get_table(self, modo='otro', is_convencional=constantes.FLUJO_CONVENCIONAL, log_queue="default"):  
      original_image = self.get_remove_small_dots(modo=modo, is_convencional=is_convencional, log_queue=log_queue)
      ans = np.zeros_like(original_image)
      h_img, w_img = original_image.shape[:2]
  
      if modo == "otro":
          kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
          region_height = int(h_img * 0.05)
          original_image[:region_height] = cv2.erode(original_image[:region_height], kernel, iterations=1)
          original_image[-region_height:] = cv2.erode(original_image[-region_height:], kernel, iterations=1)
    
      cfg = config_get_table_dict[modo]
      min_thickness = cfg["min_thickness"]
      threshold = cfg["first_threshold"]
      space_between_points = cfg["space_between_points"]

      min_line_length_horizontal = int(w_img * (0.195 if modo != "otro" else 0.25))
      if modo == "obs_lista_electores" or modo == "firma":
          ang_tol = 3 * np.pi / 180
      else:
          ang_tol = np.pi / 180
      lines = self._detect_lines(original_image,modo,h_img,w_img,threshold,space_between_points)
      return self._draw_valid_lines(ans,original_image,lines,ang_tol,min_line_length_horizontal,min_thickness)
    
    def _draw_valid_lines(self,ans,img,lines,ang_tol,min_line_length_horizontal,min_thickness):
      if lines is None:
          return ans
  
      for line in lines:
          x0, y0, x1, y1 = line[0]
          theta = math.atan2(y1 - y0, x1 - x0)
          length = math.hypot(x1 - x0, y1 - y0)
          angle_deg = abs(theta * 180 / math.pi)
          is_horizontal = angle_deg < 10 or angle_deg > 170
  
          if min(abs(theta), abs(abs(theta) - np.pi / 2)) > ang_tol:
              continue
          if is_horizontal and length < min_line_length_horizontal:
              continue
          if self.estimate_line_thickness(img, x0, y0, x1, y1) < min_thickness:
              continue
          cv2.line(ans, (x0, y0), (x1, y1), (255, 255, 255), 1, cv2.LINE_AA)
      return ans
    
    def _detect_lines(self, img, modo, h_img, w_img, threshold, space_between_points):
      if modo in ["obs_lista_electores", "firma"]:
          if modo == "obs_lista_electores":
            min_line_length_h = int(w_img * 0.25)
            min_line_length_v = int(h_img * 0.6)
          elif modo == "firma":
              min_line_length_h = int(w_img * 0.10)
              min_line_length_v = int(h_img * 0.08)
          lines = []
          
          lines_h = cv2.HoughLinesP(img, 1, np.pi / 180,threshold, None,min_line_length_h,space_between_points)
          lines_v = cv2.HoughLinesP(img, 1, np.pi / 180,threshold, None,min_line_length_v,space_between_points)
  
          if lines_h is not None:
              lines.extend(lines_h)
          if lines_v is not None:
              lines.extend(lines_v)
          return lines
      lines = cv2.HoughLinesP(img, 1, np.pi / 180,threshold, None,int(w_img * (0.1 if modo != "otro" else 0.2)),space_between_points)
      return lines
    
    def generar_json_votos(self, archivos_subidos, nombre_seccion, rec_loader=None, cod_usuario="", centro_computo=""):
        temp_json_path = resolve_workspace_path(f"{nombre_seccion}_output_temp.json")
        ctx = get_context()

        headers = [""]
        if os.path.exists(temp_json_path):
            with open(temp_json_path, "r") as f:
                json_result = json.load(f)
                json_body = json_result["body"]
                votos_counter = len([k for k in json_body[0].keys() if k.startswith("votos_")]) + 1
        else:
            json_body = [{"nro": 1}]
            votos_counter = 1

        if archivos_subidos is None:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S%f')
            temp_filename = f"{nombre_seccion}_seccion_completa_{timestamp}.png"
            temp_path = resolve_workspace_path(temp_filename)
            cv2.imwrite(temp_path, rec_loader.get_original_image())

            archivo_id = upload_file_to_dir_process_acta(temp_path, cod_usuario, centro_computo)
            if ctx:
                ctx.add_temp_file(temp_path)
            json_body[0][f"votos_{votos_counter}"] = {"file": archivo_id}
            votos_counter += 1

        else:
            for archivo_id in archivos_subidos:
                json_body[0][f"votos_{votos_counter}"] = {"file": archivo_id}
                votos_counter += 1

        json_result = {"body": json_body, "headers": headers}
        with open(temp_json_path, "w") as tmpf:
            json.dump(json_result, tmpf, indent=2)

        logger.info(f"JSON temporal generado: {temp_json_path}", queue = constantes.QUEUE_LOGGER_VALUE_PROCESS)
        return json_result, temp_json_path
    
    def _apply_binary_mask(self, img_crop, copia_a_color):
        hsv = cv2.cvtColor(img_crop, cv2.COLOR_BGR2HSV)
        low, high = mascara_dinamica(img_crop, copia_a_color)
        mask = cv2.inRange(hsv, low, high)
        return np.where(mask > 0, 255, 0).astype(np.uint8)

    def _clear_borders(self, binary):
        top, bot, left, right = 9, 8, 9, 9
        binary[:top, :] = 0
        binary[-bot:, :] = 0
        binary[:, :left] = 0
        binary[:, -right:] = 0
        return binary

    def _draw_grid(self, binary, new_image, matriz_detec, thick_line):
        try:
            for fila in matriz_detec:
                for i in range(len(fila) - 1):
                    cv2.line(binary, fila[i], fila[i + 1], 0, thick_line)
                    cv2.line(new_image, fila[i], fila[i + 1], (255, 255, 255), thick_line)

            for j in range(len(matriz_detec[0])):
                for i in range(len(matriz_detec) - 1):
                    cv2.line(binary, matriz_detec[i][j], matriz_detec[i + 1][j], 0, thick_line)
                    cv2.line(new_image, matriz_detec[i][j], matriz_detec[i + 1][j], (255, 255, 255), thick_line)

        except Exception as e:
            logger.exception(f"Error al dibujar grilla: {e}",queue=constantes.QUEUE_LOGGER_VALUE_PROCESS)

    def _build_vertical_segments_from_matrix(self, matriz_detec):
        segments = []

        for i in range(len(matriz_detec) - 1):
            (x_left, y_start) = matriz_detec[i][0]
            (x_right, _) = matriz_detec[i][1]
            (_, y_end) = matriz_detec[i + 1][0]

            width = x_right - x_left
            if width <= 0 or y_end <= y_start:
                continue

            x1 = int(x_left + width / 3)
            x2 = int(x_left + width * 2 / 3)

            segments.append((x1, y_start, y_end))
            segments.append((x2, y_start, y_end))

        return segments


    def _get_vertical_lines(self, binary, matriz_detec, copia_a_color, name):
        _, w = binary.shape[:2]

        if name == "total_votos" and not copia_a_color and matriz_detec:
            if len(matriz_detec) > 1 and len(matriz_detec[0]) > 0:
                segments = self._build_vertical_segments_from_matrix(matriz_detec)
                if segments:
                    return segments

        return [int(w / 3), int(2 * w / 3)]

    def _draw_vertical_lines(self, binary, new_image, x_positions):
        h = binary.shape[0]
        line_tickness = 5
        if isinstance(x_positions[0], int):
            for x in x_positions:
                cv2.line(binary, (x, 0), (x, h), 0, line_tickness)
                cv2.line(new_image, (x, 0), (x, h), (255, 255, 255), line_tickness)

        else:
            for x, y1, y2 in x_positions:
                cv2.line(binary, (x, y1), (x, y2), 0, line_tickness)
                cv2.line(new_image, (x, y1), (x, y2), (255, 255, 255), line_tickness)

    def _filter_and_morph(self, binary):
        contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        mask = np.zeros_like(binary)

        for c in contours:
            if cv2.contourArea(c) >= 3:
                cv2.drawContours(mask, [c], -1, 255, cv2.FILLED)

        filtered = cv2.bitwise_and(binary, mask)
        kernel = np.ones((2, 2), np.uint8)
        return cv2.morphologyEx(cv2.dilate(filtered, kernel, 1),cv2.MORPH_CLOSE,kernel)

    def get_binary_table(self, img_crop, copia_a_color, matriz_detec=None, name="otro", thick_line=5):
        new_image = img_crop.copy()

        binary = self._apply_binary_mask(img_crop, copia_a_color)
        binary = self._clear_borders(binary)
        _, binary = cv2.threshold(binary, 128, 255, cv2.THRESH_BINARY)

        if matriz_detec is not None:
            self._draw_grid(binary, new_image, matriz_detec, thick_line)

        if name in ["total_votos", "total_votos_dinamico", "seccion_total"] and not copia_a_color:
            x_positions = self._get_vertical_lines(binary, matriz_detec, copia_a_color, name)
            self._draw_vertical_lines(binary, new_image, x_positions)

        filtered_img = self._filter_and_morph(binary)
        return filtered_img, new_image

    def _build_table_image(self, img_limpia_path, point0, point3, margin=0):
        img_limpia = cv2.imread(img_limpia_path)

        h, w = img_limpia.shape[:2]

        x1 = max(0, point0[0] - margin)
        y1 = max(0, point0[1] - margin)
        x2 = min(w, point3[0] + margin)
        y2 = min(h, point3[1] + margin)

        return img_limpia[y1:y2, x1:x2]
    
    def _recrop_from_points_smart(self, img, points_matrix, margin=8):
        h, w = img.shape[:2]
        norm_points = []
        for row in points_matrix:
            norm_row = []
            for p in row:
                if hasattr(p, "__iter__"):
                    norm_row.append((int(p[0]), int(p[1])))
                else:
                    norm_row.append(p)
            norm_points.append(norm_row)

        left_xs = [min(x for x, _ in row) for row in norm_points]
        right_xs = [max(x for x, _ in row) for row in norm_points]
        top_ys = [y for _, y in norm_points[0]]
        bottom_ys = [y for _, y in norm_points[-1]]

        min_table_x = min(left_xs)
        max_table_x = max(right_xs)
        min_table_y = min(top_ys)
        max_table_y = max(bottom_ys)

        left_available   = min_table_x
        right_available  = w - max_table_x
        top_available    = min_table_y
        bottom_available = h - max_table_y

        balanced_horizontal = min(left_available, right_available, margin)
        balanced_vertical   = min(top_available, bottom_available, margin)

        min_x = max(0, min_table_x - balanced_horizontal)
        max_x = min(w, max_table_x + balanced_horizontal)

        min_y = max(0, min_table_y - balanced_vertical)
        max_y = min(h, max_table_y + balanced_vertical)

        cropped = img[min_y:max_y, min_x:max_x]

        logger.info("----- Redetectado la imagen de la tabla -----", queue = constantes.QUEUE_LOGGER_VALUE_PROCESS)
        return cropped, min_x, min_y
    
    def _validate_table_structure(self,table_points,num_rows,num_columns,tolerance_x=5,enforce_spacing=True):
        """
        Valida que la grilla esté geométricamente bien formada.
        """

        expected_points = num_columns + 1

        if len(table_points) != num_rows:
            raise ValueError("Numero de filas incorrecto")

        if any(len(row) != expected_points for row in table_points):
            raise ValueError("Alguna fila tiene numero incorrecto de columnas")

        self._validate_geometry(
            table_points,
            tolerance_x,
            enforce_spacing
        )

        return True
    
    def _validate_geometry(self, table_points, tolerance_x, enforce_spacing):
        num_columns_detected = len(table_points[0])
        for col_idx in range(num_columns_detected):

            col_x_values = [row[col_idx][0] for row in table_points]
            mean_x = sum(col_x_values) / len(col_x_values)

            if any(abs(x - mean_x) > tolerance_x for x in col_x_values):
                raise ValueError(
                    f"Columna {col_idx} desalineada (variacion excesiva en X)"
                )

        if not enforce_spacing or num_columns_detected < 2:
            return

        reference_x = [pt[0] for pt in table_points[0]]

        col_distances = [
            reference_x[i + 1] - reference_x[i]
            for i in range(num_columns_detected - 1)
        ]

        mean_dx = sum(col_distances) / len(col_distances)

        if any(abs(dx - mean_dx) > mean_dx * 0.4 for dx in col_distances):
            raise ValueError("Separacion irregular entre columnas")

    def validar_dimensiones_celdas(self, matriz, tolerancia=0.2, usar_mediana=True, log_queue="default"):
        logger.info("Ejecutando validar_dimensiones_celdas...", queue = log_queue)

        if len(matriz) < 2 or len(matriz[0]) < 2:
            raise ValueError("Matriz inválida para validar dimensiones")

        alturas = [
            matriz[i + 1][0][1] - matriz[i][0][1]
            for i in range(len(matriz) - 1)
        ]

        anchos = [
            fila[j + 1][0] - fila[j][0]
            for fila in matriz
            for j in range(len(fila) - 1)
        ]

        if usar_mediana:
            ref_alto = np.median(alturas)
            ref_ancho = np.median(anchos)
        else:
            ref_alto = np.mean(alturas)
            ref_ancho = np.mean(anchos)

        logger.info(f"[DEBUG] ancho_ref={ref_ancho}, alto_ref={ref_alto}", queue=log_queue)

        errores_altura = self._validar_dimensiones(
            valores=alturas,
            referencia=ref_alto,
            tolerancia=tolerancia,
            tipo="ALTO"
        )

        errores_ancho = self._validar_dimensiones(
            valores=anchos,
            referencia=ref_ancho,
            tolerancia=tolerancia,
            tipo="ANCHO"
        )

        errores = errores_altura + errores_ancho

        if errores:
            logger.warning("Inconsistencias detectadas:", queue=log_queue)
            for e in errores:
                logger.warning(e, queue=log_queue)

            raise ValueError(f"{len(errores)} dimensiones fuera de tolerancia")

        logger.info("Dimensiones consistentes (multi-columna)", queue=log_queue)

    def _validar_dimensiones(self, valores, referencia, tolerancia, tipo):
        errores = []

        if referencia == 0:
            return errores

        for i, val in enumerate(valores):
            diff = abs(val - referencia) / referencia
            if diff > tolerancia:
                errores.append(f"{tipo} en {i} -> {val} (dif {diff:.2%})")

        return errores



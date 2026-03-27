import {TableAction} from "./tableAction.interface";

export interface TableColumn{
  key: string;
  label: string;
  width?: string; // Define el ancho de la columna, por ejemplo, '100px', '20%', etc.
  headerAlign?: 'left' | 'center' | 'right'; // Alineación del encabezado
  cellAlign?: 'left' | 'center' | 'right'; // Alineación del contenido de la celda
  isAction?: boolean;
  actions?: TableAction[];
}

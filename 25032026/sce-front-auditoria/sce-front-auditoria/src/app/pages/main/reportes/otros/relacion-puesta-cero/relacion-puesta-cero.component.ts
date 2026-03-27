import { Component } from '@angular/core';

const ELEMENT_DATA1 = [
  { bgColor:'bg_rojo', codigo: 'C44002', cc: 'CAJAMARCA', FechaEnvioCC: '26/05/2024 15:31:26', FechaRecepcionCC:'26/05/2024 19:26:47', estado: 'Realizada'},
  { bgColor:'bg_rojo', codigo: 'C44002', cc: 'BONGARA', FechaEnvioCC: '26/05/2024 15:31:26', FechaRecepcionCC:'26/05/2024 19:26:47', estado: 'Realizada'},
  { bgColor:'bg_rojo', codigo: 'C44002', cc: 'LIMA', FechaEnvioCC: '26/05/2024 15:31:26', FechaRecepcionCC:'26/05/2024 19:26:47', estado: 'Realizada'},
  { bgColor:'bg_amarillo', codigo: 'C44002', cc: 'AREQUIPA', FechaEnvioCC: '26/05/2024 15:31:26', FechaRecepcionCC:'26/05/2024 19:26:47', estado: 'Realizada'},
  { bgColor:'bg_amarillo', codigo: 'C44002', cc: 'CUSCO', FechaEnvioCC: '26/05/2024 15:31:26', FechaRecepcionCC:'26/05/2024 19:26:47', estado: 'Pendiente'},
  { bgColor:'bg_amarillo', codigo: 'C44002', cc: 'AMAZONAS', FechaEnvioCC: '26/05/2024 15:31:26', FechaRecepcionCC:'26/05/2024 19:26:47', estado: 'Realizada'},
  { bgColor:'bg_amarillo', codigo: 'C44002', cc: 'LA LIBERTAD', FechaEnvioCC: '26/05/2024 15:31:26', FechaRecepcionCC:'26/05/2024 19:26:47', estado: 'Realizada'},
  { bgColor:'bg_amarillo', codigo: 'C44002', cc: 'PUNO', FechaEnvioCC: '26/05/2024 15:31:26', FechaRecepcionCC:'26/05/2024 19:26:47', estado: 'Pendiente'},
  { bgColor:'bg_amarillo', codigo: 'C44002', cc: 'SAN MARTIN', FechaEnvioCC: '26/05/2024 15:31:26', FechaRecepcionCC:'26/05/2024 19:26:47', estado: 'Realizada'},
  { bgColor:'bg_amarillo', codigo: 'C44002', cc: 'TACNA', FechaEnvioCC: '26/05/2024 15:31:26', FechaRecepcionCC:'26/05/2024 19:26:47', estado: 'Realizada'},

 
];

@Component({
  selector: 'app-relacion-puesta-cero',
  templateUrl: './relacion-puesta-cero.component.html',
})
export class RelacionPuestaCeroComponent {
  displayedColumns1: string[] = ['codigo', 'cc', 'FechaEnvioCC', 'FechaRecepcionCC', 'estado'];
  dataSource1 = ELEMENT_DATA1;
}

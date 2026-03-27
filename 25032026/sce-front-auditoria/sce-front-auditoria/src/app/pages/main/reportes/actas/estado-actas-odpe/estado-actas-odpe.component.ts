import { Component } from '@angular/core';

const ELEMENT_DATA1 = [
  { id: '1', odpe: 'AMAZONAS', cc: 'BONGARA', actasProcesar:'12', actasPendientesProcesar:'3', actasProcesadas:'1', JEExResolver:'0', jeeResueltas:'2', resolverResueltas:'2'},
  { id: '2', odpe: 'ANCASH', cc: 'BONGARA', actasProcesar:'12', actasPendientesProcesar:'3', actasProcesadas:'0', JEExResolver:'3', jeeResueltas:'2', resolverResueltas:'2'},
  { id: '3', odpe: 'APURIMAC', cc: 'BONGARA', actasProcesar:'12', actasPendientesProcesar:'2', actasProcesadas:'1', JEExResolver:'2', jeeResueltas:'2', resolverResueltas:'2'},
  { id: '4', odpe: 'AYACUCHO', cc: 'BONGARA', actasProcesar:'12', actasPendientesProcesar:'2', actasProcesadas:'0', JEExResolver:'2', jeeResueltas:'22', resolverResueltas:'2'},
  { id: '5', odpe: 'CAJAMARCA', cc: 'BONGARA', actasProcesar:'12', actasPendientesProcesar:'2', actasProcesadas:'1', JEExResolver:'2', jeeResueltas:'2', resolverResueltas:'2'},
  { id: '6', odpe: 'CALLAO', cc: 'BONGARA', actasProcesar:'12', actasPendientesProcesar:'15', actasProcesadas:'0', JEExResolver:'0', jeeResueltas:'2', resolverResueltas:'2'},
  { id: '7', odpe: 'CUSCO', cc: 'BONGARA', actasProcesar:'12', actasPendientesProcesar:'2', actasProcesadas:'0', JEExResolver:'2', jeeResueltas:'2', resolverResueltas:'2'},
  { id: '8', odpe: 'HUANCAVELICA', cc: 'BONGARA', actasProcesar:'12', actasPendientesProcesar:'2', actasProcesadas:'0', JEExResolver:'2', jeeResueltas:'2', resolverResueltas:'2'},
  { id: '9', odpe: 'AMAZONAS', cc: 'BONGARA', actasProcesar:'12', actasPendientesProcesar:'5', actasProcesadas:'0', JEExResolver:'2', jeeResueltas:'2', resolverResueltas:'2'},
  { id: '10', odpe: 'AMAZONAS', cc: 'BONGARA', actasProcesar:'12', actasPendientesProcesar:'16', actasProcesadas:'1', JEExResolver:'0', jeeResueltas:'2', resolverResueltas:'2'},
  { id: '11', odpe: 'AMAZONAS', cc: 'BONGARA', actasProcesar:'12', actasPendientesProcesar:'20', actasProcesadas:'1', JEExResolver:'0', jeeResueltas:'2', resolverResueltas:'2'},
  { id: '12', odpe: 'AMAZONAS', cc: 'BONGARA', actasProcesar:'12', actasPendientesProcesar:'6', actasProcesadas:'0', JEExResolver:'0', jeeResueltas:'2', resolverResueltas:'2'},
];

const ELEMENT_DATA2 = [
  { id: '', bgColor:'bg_celeste', odpe: '', cc: 'TOTAL', actasProcesar:'108', actasPendientesProcesar:'72', actasProcesadas:'36', JEExResolver:'0', jeeResueltas:'18', resolverResueltas:'18'},
];

@Component({
  selector: 'app-estado-actas-odpe',
  templateUrl: './estado-actas-odpe.component.html',
})

export class EstadoActasOdpeComponent {
  displayedColumns1: string[] = ['id', 'odpe', 'cc', 'actasProcesar', 'actasPendientesProcesar' , 'actasProcesadas', 'JEExResolver', 'jeeResueltas', 'resolverResueltas'];
  dataSource1 = ELEMENT_DATA1;

  displayedColumns2: string[] = ['id', 'odpe', 'cc', 'actasProcesar', 'actasPendientesProcesar' , 'actasProcesadas', 'JEExResolver', 'jeeResueltas', 'resolverResueltas'];
  dataSource2 = ELEMENT_DATA2;
}


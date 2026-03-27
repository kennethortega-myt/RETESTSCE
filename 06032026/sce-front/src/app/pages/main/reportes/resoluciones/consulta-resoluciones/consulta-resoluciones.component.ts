import { Component } from '@angular/core';

const ELEMENT_DATA1 = [
  { codigo: 'C44002000001', resolucion: 'EXP MESA NO INSTALADA', tipo: 'Mesas no instaladas', estado:'Procesado', acta:'000328', eleccion:'Presidencial', fecha:'11/01/2021 16:18:35'},
  { codigo: 'C44002000001', resolucion: 'EXP MESA NO INSTALADA', tipo: 'Mesas no instaladas', estado:'Procesado', acta:'000328', eleccion:'Congresal', fecha:'11/01/2021 16:18:35'},
  { codigo: 'C44002000001', resolucion: 'EXP MESA NO INSTALADA', tipo: 'Mesas no instaladas', estado:'Procesado', acta:'000328', eleccion:'Parlamento Andino', fecha:'11/01/2021 16:18:35'},
  { codigo: 'C44002000001', resolucion: 'EXP ACTA EXTRAVIADA', tipo: 'Actas Extraviadas', estado:'Procesado', acta:'000328', eleccion:'Congresal', fecha:'11/01/2021 16:18:35'},
  { codigo: 'C44002000001', resolucion: 'EXP ACTAS SINIESTRADA', tipo: 'Actas Siniestradas', estado:'Procesado', acta:'000328', eleccion:'Congresal', fecha:'11/01/2021 16:18:35'},
  { codigo: 'C44002000001', resolucion: 'EXP RESOLVER ACTA SINIESTRADA', tipo: 'Actas Enviadas al JEE', estado:'Procesado', acta:'000328', eleccion:'Congresal', fecha:'11/01/2021 16:18:35'},
  { codigo: 'C44002000001', resolucion: 'EXP Nº 0001 ACTA 000413...', tipo: 'Actas Enviadas al JEE', estado:'Procesado', acta:'000328', eleccion:'Congresal', fecha:'11/01/2021 16:18:35'},
  { codigo: 'C44002000001', resolucion: 'EXT PRUEBA CAMBIO NOM…', tipo: 'Actas Extraviadas', estado:'Procesado', acta:'000328', eleccion:'Presidencial', fecha:'11/01/2021 16:18:35'},
  { codigo: 'C44002000001', resolucion: 'EXT PRUEBA CAMBIO NOM…', tipo: 'Actas Extraviadas', estado:'Procesado', acta:'000328', eleccion:'Presidencial', fecha:'11/01/2021 16:18:35'},
  { codigo: 'C44002000001', resolucion: 'EXT PRUEBA CAMBIO NOM…', tipo: 'Actas Extraviadas', estado:'En Digitación', acta:'000328', eleccion:'Congresal', fecha:'11/01/2021 16:18:35'},
  { codigo: 'C44002000001', resolucion: 'RESOLEXT', tipo: 'Actas Enviadas al JEE', estado:'En Digitación', acta:'000328', eleccion:'Presidencial', fecha:'11/01/2021 16:18:35'},
  { codigo: 'C44002000001', resolucion: 'RESOLEXT', tipo: 'Actas Enviadas al JEE', estado:'Sin Procesar', acta:'000328', eleccion:'Congresal', fecha:'11/01/2021 16:18:35'},

];

@Component({
  selector: 'app-consulta-resoluciones',
  templateUrl: './consulta-resoluciones.component.html'
})
export class ConsultaResolucionesComponent {
  displayedColumns1: string[] = ['codigo', 'resolucion', 'tipo', 'estado', 'acta' , 'eleccion','fecha'];
  dataSource1 = ELEMENT_DATA1;
}

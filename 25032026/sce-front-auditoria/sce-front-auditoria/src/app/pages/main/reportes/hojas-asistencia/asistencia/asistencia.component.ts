import { Component } from '@angular/core';

const ELEMENT_DATA1 = [
  { numero: '1', dni: '33727027', ApellidosNombres: 'SANCHEZ LLATAS JOSE ALBERTO', asistencia:'OMISO'},
  { numero: '2', dni: '33727027', ApellidosNombres: 'SANCHEZ LLATAS JOSE ALBERTO', asistencia:'OMISO'},
  { numero: '3', dni: '33727027', ApellidosNombres: 'SANCHEZ LLATAS JOSE ALBERTO', asistencia:'OMISO'},
  { numero: '4', dni: '33727027', ApellidosNombres: 'SANCHEZ LLATAS JOSE ALBERTO', asistencia:'OMISO'},
  { numero: '5', dni: '33727027', ApellidosNombres: 'SANCHEZ LLATAS JOSE ALBERTO', asistencia:'OMISO'},
  { numero: '6', dni: '33727027', ApellidosNombres: 'SANCHEZ LLATAS JOSE ALBERTO', asistencia:'OMISO'},
  { numero: '7', dni: '33727027', ApellidosNombres: 'SANCHEZ LLATAS JOSE ALBERTO', asistencia:'OMISO'},
  { numero: '8', dni: '33727027', ApellidosNombres: 'SANCHEZ LLATAS JOSE ALBERTO', asistencia:'OMISO'},
  { numero: '9', dni: '33727027', ApellidosNombres: 'SANCHEZ LLATAS JOSE ALBERTO', asistencia:'OMISO'},
  { numero: '10', dni: '33727027', ApellidosNombres: 'SANCHEZ LLATAS JOSE ALBERTO', asistencia:'OMISO'},

 
];

@Component({
  selector: 'app-asistencia',
  templateUrl: './asistencia.component.html',
})

export class AsistenciaComponent {
  displayedColumns1: string[] = ['numero', 'dni', 'ApellidosNombres', 'asistencia'];
  dataSource1 = ELEMENT_DATA1;
}
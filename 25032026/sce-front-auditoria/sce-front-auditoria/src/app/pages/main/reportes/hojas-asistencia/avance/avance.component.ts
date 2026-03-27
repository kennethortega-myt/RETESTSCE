import { Component } from '@angular/core';

const ELEMENT_DATA1 = [
  { ubigeo: '010301', departamento: 'AMAZONAS', provincia: 'BONGARA', distrito:'JUNBILLA', TotalMesas:'3', MesasRegistradas:'1', TotalElectores:'856', TotalOmisos:'2', porAvanceMesas:'33.333 %'},
  { ubigeo: '010302', departamento: 'AMAZONAS', provincia: 'BONGARA', distrito:'COROSHA', TotalMesas:'3', MesasRegistradas:'0', TotalElectores:'3', TotalOmisos:'2', porAvanceMesas:'0.000 %'},
  { ubigeo: '010303', departamento: 'AMAZONAS', provincia: 'BONGARA', distrito:'CUIPES', TotalMesas:'2', MesasRegistradas:'1', TotalElectores:'2', TotalOmisos:'2', porAvanceMesas:'33.333 %'},
  { ubigeo: '010304', departamento: 'AMAZONAS', provincia: 'BONGARA', distrito:'CHISQUILLA', TotalMesas:'2', MesasRegistradas:'0', TotalElectores:'2', TotalOmisos:'2', porAvanceMesas:'33.333 %'},
  { ubigeo: '010305', departamento: 'AMAZONAS', provincia: 'BONGARA', distrito:'CHURUJA', TotalMesas:'2', MesasRegistradas:'1', TotalElectores:'2', TotalOmisos:'2', porAvanceMesas:'0.000 %'},
  { ubigeo: '010306', departamento: 'AMAZONAS', provincia: 'BONGARA', distrito:'FLORIDA', TotalMesas:'15', MesasRegistradas:'0', TotalElectores:'15', TotalOmisos:'2', porAvanceMesas:'0.000 %'},
  { ubigeo: '010307', departamento: 'AMAZONAS', provincia: 'BONGARA', distrito:'RECTA', TotalMesas:'2', MesasRegistradas:'0', TotalElectores:'2', TotalOmisos:'2', porAvanceMesas:'0.000 %'},
  { ubigeo: '010308', departamento: 'AMAZONAS', provincia: 'BONGARA', distrito:'SAN CARLOS', TotalMesas:'2', MesasRegistradas:'0', TotalElectores:'2', TotalOmisos:'2', porAvanceMesas:'0.000 %'},
  { ubigeo: '010309', departamento: 'AMAZONAS', provincia: 'BONGARA', distrito:'SHIPASBAMBA', TotalMesas:'5', MesasRegistradas:'0', TotalElectores:'2', TotalOmisos:'2', porAvanceMesas:'0.000 %'},
  { ubigeo: '010310', departamento: 'AMAZONAS', provincia: 'BONGARA', distrito:'JAZAN', TotalMesas:'16', MesasRegistradas:'1', TotalElectores:'5,856', TotalOmisos:'2', porAvanceMesas:'33.333 %'},
  { ubigeo: '010311', departamento: 'AMAZONAS', provincia: 'BONGARA', distrito:'LAMUD', TotalMesas:'20', MesasRegistradas:'1', TotalElectores:'1,648', TotalOmisos:'2', porAvanceMesas:'16.667 %'},
  { ubigeo: '010312', departamento: 'AMAZONAS', provincia: 'BONGARA', distrito:'CAMPORREDONDO', TotalMesas:'6', MesasRegistradas:'0', TotalElectores:'847', TotalOmisos:'2', porAvanceMesas:'0.000 %'},

 
];

@Component({
  selector: 'app-avance',
  templateUrl: './avance.component.html',
})

export class AvanceComponent {
  displayedColumns1: string[] = ['ubigeo', 'departamento', 'provincia', 'distrito', 'TotalMesas' , 'MesasRegistradas','TotalElectores', 'TotalOmisos', 'porAvanceMesas'];
  dataSource1 = ELEMENT_DATA1;
}
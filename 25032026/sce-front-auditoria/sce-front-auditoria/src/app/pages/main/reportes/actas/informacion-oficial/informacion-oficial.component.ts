import { Component } from '@angular/core';

const ELEMENT_DATA1 = [
  { ubigeo: '010301', departamento: 'AMAZONAS', provincia: 'BONGARA', distrito:'JUNBILLA', ElectoresHabiles:'3', Ciudadanos:'1', ausentismo:'856', porParticipacion:'66.667 %', porAusentismo:'33.333 %'},
  { ubigeo: '010302', departamento: 'AMAZONAS', provincia: 'BONGARA', distrito:'COROSHA', ElectoresHabiles:'3', Ciudadanos:'0', ausentismo:'3', porParticipacion:'66.667 %', porAusentismo:'0.000 %'},
  { ubigeo: '010303', departamento: 'AMAZONAS', provincia: 'BONGARA', distrito:'CUIPES', ElectoresHabiles:'2', Ciudadanos:'1', ausentismo:'2', porParticipacion:'66.667 %', porAusentismo:'33.333 %'},
  { ubigeo: '010304', departamento: 'AMAZONAS', provincia: 'BONGARA', distrito:'CHISQUILLA', ElectoresHabiles:'2', Ciudadanos:'0', ausentismo:'2', porParticipacion:'266.667 %', porAusentismo:'33.333 %'},
  { ubigeo: '010305', departamento: 'AMAZONAS', provincia: 'BONGARA', distrito:'CHURUJA', ElectoresHabiles:'2', Ciudadanos:'1', ausentismo:'2', porParticipacion:'66.667 %', porAusentismo:'0.000 %'},
  { ubigeo: '010306', departamento: 'AMAZONAS', provincia: 'BONGARA', distrito:'FLORIDA', ElectoresHabiles:'15', Ciudadanos:'0', ausentismo:'15', porParticipacion:'66.667 %', porAusentismo:'0.000 %'},
  { ubigeo: '010307', departamento: 'AMAZONAS', provincia: 'BONGARA', distrito:'RECTA', ElectoresHabiles:'2', Ciudadanos:'0', ausentismo:'2', porParticipacion:'66.667 %', porAusentismo:'0.000 %'},
  { ubigeo: '010308', departamento: 'AMAZONAS', provincia: 'BONGARA', distrito:'SAN CARLOS', ElectoresHabiles:'2', Ciudadanos:'0', ausentismo:'2', porParticipacion:'66.667 %', porAusentismo:'0.000 %'},
  { ubigeo: '010309', departamento: 'AMAZONAS', provincia: 'BONGARA', distrito:'SHIPASBAMBA', ElectoresHabiles:'5', Ciudadanos:'0', ausentismo:'2', porParticipacion:'66.667 %', porAusentismo:'0.000 %'},
  { ubigeo: '010310', departamento: 'AMAZONAS', provincia: 'BONGARA', distrito:'JAZAN', ElectoresHabiles:'16', Ciudadanos:'1', ausentismo:'5,856', porParticipacion:'66.667 %', porAusentismo:'33.333 %'},
  { ubigeo: '010311', departamento: 'AMAZONAS', provincia: 'BONGARA', distrito:'LAMUD', ElectoresHabiles:'20', Ciudadanos:'1', ausentismo:'1,648', porParticipacion:'66.667 %', porAusentismo:'16.667 %'},
  { ubigeo: '010312', departamento: 'AMAZONAS', provincia: 'BONGARA', distrito:'CAMPORREDONDO', ElectoresHabiles:'6', Ciudadanos:'0', ausentismo:'847', porParticipacion:'66.667 %', porAusentismo:'0.000 %'},
];

@Component({
  selector: 'app-informacion-oficial',
  templateUrl: './informacion-oficial.component.html',
})
export class InformacionOficialComponent {
  displayedColumns1: string[] = ['ubigeo', 'departamento', 'provincia', 'distrito', 'ElectoresHabiles' , 'Ciudadanos','ausentismo', 'porParticipacion', 'porAusentismo'];
  dataSource1 = ELEMENT_DATA1;
}

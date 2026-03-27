import { Component } from '@angular/core';

const ELEMENT_DATA1 = [
  { ubigeo: '010301', departamento: 'AMAZONAS', provincia: 'BONGARA', distrito:'JUNBILLA', TotalMesas:'3', MesasRegistradas:'1', TotalElectores:'856', varones:'2', mujeres:'33.333 %', total: '', AusentismoVarones:'9', AusentismoMujeres:'9', AusentismoTotal:'4.327%', ParticipacionPor:'5%', TotalPor:'2.885%'},
  { ubigeo: '010301', departamento: 'AMAZONAS', provincia: 'BONGARA', distrito:'JAZAN', TotalMesas:'3', MesasRegistradas:'1', TotalElectores:'856', varones:'2', mujeres:'33.333 %', total: '', AusentismoVarones:'9', AusentismoMujeres:'9', AusentismoTotal:'4.327%', ParticipacionPor:'6%', TotalPor:'2.885%'},
  { ubigeo: '010301', departamento: 'AMAZONAS', provincia: 'LUYA', distrito:'LAMUD', TotalMesas:'3', MesasRegistradas:'1', TotalElectores:'856', varones:'2', mujeres:'33.333 %', total: '', AusentismoVarones:'9', AusentismoMujeres:'9', AusentismoTotal:'4.327%', ParticipacionPor:'5%', TotalPor:'2.885%'},
  { ubigeo: '010301', departamento: 'AMAZONAS', provincia: 'LUYA', distrito:'COINLA', TotalMesas:'3', MesasRegistradas:'1', TotalElectores:'856', varones:'2', mujeres:'33.333 %', total: '', AusentismoVarones:'9', AusentismoMujeres:'9', AusentismoTotal:'4.327%', ParticipacionPor:'6%', TotalPor:'2.885%'},
 
];
const ELEMENT_DATA2 = [
  {  bgColor:'bg_celeste', ubigeo: '', departamento: '', provincia: 'TOTAL', distrito:'', TotalMesas:'35', MesasRegistradas:'4',TotalElectores:'9,798',AusentismoVarones:'9', AusentismoMujeres: '9', AusentismoTotal: '4.327%', ParticipacionPor:'6%', TotalPor:'2.885%'},
];

@Component({
  selector: 'app-por-genero',
  templateUrl: './por-genero.component.html',
})

export class PorGeneroComponent {
  displayedColumns1: string[] = ['ubigeo', 'departamento', 'provincia', 'distrito', 'TotalMesas' , 'MesasRegistradas', 'TotalElectores', 'ausentismo', 'ParticipacionPor', 'TotalPor'];
  displayedColumns2: string[] = ['ubigeo', 'departamento', 'provincia', 'distrito', 'TotalMesas' , 'MesasRegistradas', 'TotalElectores','AusentismoVarones','AusentismoMujeres','AusentismoTotal','ParticipacionPor', 'TotalPor'];
  dataSource1 = ELEMENT_DATA1;
  dataSource2 = ELEMENT_DATA2;
  
}



import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaResolucionesComponent } from './lista-resoluciones.component';

describe('ListaResolucionesComponent', () => {
  let component: ListaResolucionesComponent;
  let fixture: ComponentFixture<ListaResolucionesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListaResolucionesComponent]
    });
    fixture = TestBed.createComponent(ListaResolucionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

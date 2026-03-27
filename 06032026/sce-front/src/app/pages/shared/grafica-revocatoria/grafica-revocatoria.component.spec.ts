import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficaRevocatoriaComponent } from './grafica-revocatoria.component';

describe('GraficaRevocatoriaComponent', () => {
  let component: GraficaRevocatoriaComponent;
  let fixture: ComponentFixture<GraficaRevocatoriaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GraficaRevocatoriaComponent]
    });
    fixture = TestBed.createComponent(GraficaRevocatoriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

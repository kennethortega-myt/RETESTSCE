import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaDetalleResultadosComponent } from './tabla-detalle-resultados.component';

describe('TablaDetalleResultadosComponent', () => {
  let component: TablaDetalleResultadosComponent;
  let fixture: ComponentFixture<TablaDetalleResultadosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TablaDetalleResultadosComponent]
    });
    fixture = TestBed.createComponent(TablaDetalleResultadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

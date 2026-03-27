import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaDetalleResultadosCprComponent } from './tabla-detalle-resultados-cpr.component';

describe('TablaDetalleResultadosCprComponent', () => {
  let component: TablaDetalleResultadosCprComponent;
  let fixture: ComponentFixture<TablaDetalleResultadosCprComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablaDetalleResultadosCprComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablaDetalleResultadosCprComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

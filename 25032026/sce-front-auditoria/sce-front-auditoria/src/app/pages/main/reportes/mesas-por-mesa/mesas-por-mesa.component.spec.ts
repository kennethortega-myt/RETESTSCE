import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesasPorMesaComponent } from './mesas-por-mesa.component';

describe('MesasPorMesaComponent', () => {
  let component: MesasPorMesaComponent;
  let fixture: ComponentFixture<MesasPorMesaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MesasPorMesaComponent]
    });
    fixture = TestBed.createComponent(MesasPorMesaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

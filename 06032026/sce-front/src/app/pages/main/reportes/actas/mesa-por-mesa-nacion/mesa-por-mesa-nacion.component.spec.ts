import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesaPorMesaNacionComponent } from './mesa-por-mesa-nacion.component';

describe('MesaPorMesaNacionComponent', () => {
  let component: MesaPorMesaNacionComponent;
  let fixture: ComponentFixture<MesaPorMesaNacionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MesaPorMesaNacionComponent]
    });
    fixture = TestBed.createComponent(MesaPorMesaNacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

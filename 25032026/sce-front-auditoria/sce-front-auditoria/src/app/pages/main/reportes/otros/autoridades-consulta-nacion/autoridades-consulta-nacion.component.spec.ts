import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoridadesConsultaNacionComponent } from './autoridades-consulta-nacion.component';

describe('AutoridadesConsultaNacionComponent', () => {
  let component: AutoridadesConsultaNacionComponent;
  let fixture: ComponentFixture<AutoridadesConsultaNacionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AutoridadesConsultaNacionComponent]
    });
    fixture = TestBed.createComponent(AutoridadesConsultaNacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

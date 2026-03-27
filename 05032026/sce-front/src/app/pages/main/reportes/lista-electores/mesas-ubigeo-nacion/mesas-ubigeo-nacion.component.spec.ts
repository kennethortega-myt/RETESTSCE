import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesasUbigeoNacionComponent } from './mesas-ubigeo-nacion.component';

describe('MesasUbigeoNacionComponent', () => {
  let component: MesasUbigeoNacionComponent;
  let fixture: ComponentFixture<MesasUbigeoNacionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MesasUbigeoNacionComponent]
    });
    fixture = TestBed.createComponent(MesasUbigeoNacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

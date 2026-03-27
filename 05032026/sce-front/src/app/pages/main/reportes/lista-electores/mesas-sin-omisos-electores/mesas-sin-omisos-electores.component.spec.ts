import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesasSinOmisosElectoresComponent } from './mesas-sin-omisos-electores.component';

describe('MesasSinOmisosElectoresComponent', () => {
  let component: MesasSinOmisosElectoresComponent;
  let fixture: ComponentFixture<MesasSinOmisosElectoresComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MesasSinOmisosElectoresComponent]
    });
    fixture = TestBed.createComponent(MesasSinOmisosElectoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

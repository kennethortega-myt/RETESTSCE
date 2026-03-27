import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizacionesPoliticasNacionComponent } from './organizaciones-politicas-nacion.component';

describe('OrganizacionesPoliticasNacionComponent', () => {
  let component: OrganizacionesPoliticasNacionComponent;
  let fixture: ComponentFixture<OrganizacionesPoliticasNacionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrganizacionesPoliticasNacionComponent]
    });
    fixture = TestBed.createComponent(OrganizacionesPoliticasNacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

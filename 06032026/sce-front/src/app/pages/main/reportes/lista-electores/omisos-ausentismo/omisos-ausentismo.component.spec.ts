import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OmisosAusentismoComponent } from './omisos-ausentismo.component';

describe('OmisosAusentismoComponent', () => {
  let component: OmisosAusentismoComponent;
  let fixture: ComponentFixture<OmisosAusentismoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OmisosAusentismoComponent]
    });
    fixture = TestBed.createComponent(OmisosAusentismoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

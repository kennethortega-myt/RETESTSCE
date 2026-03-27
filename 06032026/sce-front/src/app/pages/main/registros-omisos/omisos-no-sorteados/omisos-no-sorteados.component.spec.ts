import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OmisosNoSorteadosComponent } from './omisos-no-sorteados.component';

describe('OmisosNoSorteadosComponent', () => {
  let component: OmisosNoSorteadosComponent;
  let fixture: ComponentFixture<OmisosNoSorteadosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OmisosNoSorteadosComponent]
    });
    fixture = TestBed.createComponent(OmisosNoSorteadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

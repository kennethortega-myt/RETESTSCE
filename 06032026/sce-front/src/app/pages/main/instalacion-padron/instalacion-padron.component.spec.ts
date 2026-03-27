import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstalacionPadronComponent } from './instalacion-padron.component';

describe('InstalacionPaginadoComponent', () => {
  let component: InstalacionPadronComponent;
  let fixture: ComponentFixture<InstalacionPadronComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InstalacionPadronComponent]
    });
    fixture = TestBed.createComponent(InstalacionPadronComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

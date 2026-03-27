import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnvioActasComponent } from './envio-actas.component';

describe('EnvioActasComponent', () => {
  let component: EnvioActasComponent;
  let fixture: ComponentFixture<EnvioActasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EnvioActasComponent]
    });
    fixture = TestBed.createComponent(EnvioActasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

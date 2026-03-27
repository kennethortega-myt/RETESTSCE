import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiembrosMesaComponent } from './miembros-mesa.component';

describe('AvanceComponent', () => {
  let component: MiembrosMesaComponent;
  let fixture: ComponentFixture<MiembrosMesaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MiembrosMesaComponent]
    });
    fixture = TestBed.createComponent(MiembrosMesaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

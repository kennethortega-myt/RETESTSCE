import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumenTotalNacionComponent } from './resumen-total-nacion.component';

describe('ResumenTotalNacionComponent', () => {
  let component: ResumenTotalNacionComponent;
  let fixture: ComponentFixture<ResumenTotalNacionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ResumenTotalNacionComponent]
    });
    fixture = TestBed.createComponent(ResumenTotalNacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

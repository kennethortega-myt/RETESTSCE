import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupResolucionAplicadaComponent } from './popup-resolucion-aplicada.component';

describe('PopupResolucionAplicadaComponent', () => {
  let component: PopupResolucionAplicadaComponent;
  let fixture: ComponentFixture<PopupResolucionAplicadaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupResolucionAplicadaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupResolucionAplicadaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

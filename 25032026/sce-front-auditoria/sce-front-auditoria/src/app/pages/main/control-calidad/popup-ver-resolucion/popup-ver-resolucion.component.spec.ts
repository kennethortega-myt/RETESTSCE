import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupVerResolucionComponent } from './popup-ver-resolucion.component';

describe('PopupVerResolucionComponent', () => {
  let component: PopupVerResolucionComponent;
  let fixture: ComponentFixture<PopupVerResolucionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupVerResolucionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupVerResolucionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

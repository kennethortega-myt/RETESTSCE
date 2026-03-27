import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupRequiereAutorizacionComponent } from './popup-requiere-autorizacion.component';

describe('PopupRequiereAutorizacionComponent', () => {
  let component: PopupRequiereAutorizacionComponent;
  let fixture: ComponentFixture<PopupRequiereAutorizacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupRequiereAutorizacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupRequiereAutorizacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

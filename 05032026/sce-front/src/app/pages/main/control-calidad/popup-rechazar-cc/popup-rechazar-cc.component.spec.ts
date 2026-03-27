import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupRechazarCcComponent } from './popup-rechazar-cc.component';

describe('PopupRechazarCcComponent', () => {
  let component: PopupRechazarCcComponent;
  let fixture: ComponentFixture<PopupRechazarCcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupRechazarCcComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupRechazarCcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

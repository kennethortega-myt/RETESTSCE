import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupCierreActividadesComponent } from './popup-cierre-actividades.component';

describe('PopupCierreActividadesComponent', () => {
  let component: PopupCierreActividadesComponent;
  let fixture: ComponentFixture<PopupCierreActividadesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupCierreActividadesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupCierreActividadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupReanudarActividadesComponent } from './popup-reanudar-actividades.component';

describe('PopupReanudarActividadesComponent', () => {
  let component: PopupReanudarActividadesComponent;
  let fixture: ComponentFixture<PopupReanudarActividadesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupReanudarActividadesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupReanudarActividadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

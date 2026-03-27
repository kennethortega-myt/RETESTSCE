import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CierreActividadesComponent } from './cierre-actividades.component';

describe('CierreActividadesComponent', () => {
  let component: CierreActividadesComponent;
  let fixture: ComponentFixture<CierreActividadesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CierreActividadesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CierreActividadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

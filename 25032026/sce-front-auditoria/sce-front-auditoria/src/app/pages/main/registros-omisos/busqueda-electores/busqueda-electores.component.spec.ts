import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusquedaElectoresComponent } from './busqueda-electores.component';

describe('BusquedaElectoresComponent', () => {
  let component: BusquedaElectoresComponent;
  let fixture: ComponentFixture<BusquedaElectoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusquedaElectoresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusquedaElectoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

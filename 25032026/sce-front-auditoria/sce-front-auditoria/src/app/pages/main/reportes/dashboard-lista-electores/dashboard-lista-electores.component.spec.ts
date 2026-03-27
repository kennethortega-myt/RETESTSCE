import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardListaElectoresComponent } from './dashboard-lista-electores.component';

describe('DashboardListaElectoresComponent', () => {
  let component: DashboardListaElectoresComponent;
  let fixture: ComponentFixture<DashboardListaElectoresComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardListaElectoresComponent]
    });
    fixture = TestBed.createComponent(DashboardListaElectoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaElectoresComponent } from './lista-electores.component';

describe('ListaElectoresComponent', () => {
  let component: ListaElectoresComponent;
  let fixture: ComponentFixture<ListaElectoresComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListaElectoresComponent]
    });
    fixture = TestBed.createComponent(ListaElectoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

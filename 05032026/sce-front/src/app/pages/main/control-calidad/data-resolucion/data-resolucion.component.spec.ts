import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataResolucionComponent } from './data-resolucion.component';

describe('DataResolucionComponent', () => {
  let component: DataResolucionComponent;
  let fixture: ComponentFixture<DataResolucionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataResolucionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataResolucionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

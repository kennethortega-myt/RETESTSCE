import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DescargaInstalacionComponent } from './descarga-instalacion.component';

describe('DescargaInstalacionComponent', () => {
  let component: DescargaInstalacionComponent;
  let fixture: ComponentFixture<DescargaInstalacionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DescargaInstalacionComponent]
    });
    fixture = TestBed.createComponent(DescargaInstalacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

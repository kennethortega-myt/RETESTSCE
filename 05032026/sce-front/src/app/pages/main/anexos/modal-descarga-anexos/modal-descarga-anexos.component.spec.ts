import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDescargaAnexosComponent } from './modal-descarga-anexos.component';

describe('ModalDescargaAnexosComponent', () => {
  let component: ModalDescargaAnexosComponent;
  let fixture: ComponentFixture<ModalDescargaAnexosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalDescargaAnexosComponent]
    });
    fixture = TestBed.createComponent(ModalDescargaAnexosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

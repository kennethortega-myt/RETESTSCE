import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidatosOrgPoliticaNacionComponent } from './candidatos-org-politica-nacion.component';

describe('CandidatosOrgPoliticaNacionComponent', () => {
  let component: CandidatosOrgPoliticaNacionComponent;
  let fixture: ComponentFixture<CandidatosOrgPoliticaNacionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CandidatosOrgPoliticaNacionComponent]
    });
    fixture = TestBed.createComponent(CandidatosOrgPoliticaNacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

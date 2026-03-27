import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnaVotosComponent } from './columna-votos.component';

describe('ColumnaVotosComponent', () => {
  let component: ColumnaVotosComponent;
  let fixture: ComponentFixture<ColumnaVotosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColumnaVotosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColumnaVotosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

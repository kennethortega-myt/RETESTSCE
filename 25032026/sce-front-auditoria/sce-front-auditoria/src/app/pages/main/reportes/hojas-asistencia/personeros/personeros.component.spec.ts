import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonerosComponent } from './personeros.component';

describe('PersonerosComponent', () => {
  let component: PersonerosComponent;
  let fixture: ComponentFixture<PersonerosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PersonerosComponent]
    });
    fixture = TestBed.createComponent(PersonerosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

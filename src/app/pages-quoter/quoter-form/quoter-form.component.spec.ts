import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoterFormComponent } from './quoter-form.component';

describe('QuoterFormComponent', () => {
  let component: QuoterFormComponent;
  let fixture: ComponentFixture<QuoterFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuoterFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuoterFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

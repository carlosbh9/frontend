import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatorsServicesComponent } from './operators-services.component';

describe('OperatorsServicesComponent', () => {
  let component: OperatorsServicesComponent;
  let fixture: ComponentFixture<OperatorsServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperatorsServicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OperatorsServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainServicesComponent } from './train-services.component';

describe('TrainServicesComponent', () => {
  let component: TrainServicesComponent;
  let fixture: ComponentFixture<TrainServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainServicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

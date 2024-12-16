import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainComponent } from './train.component';
import { TrainService } from '../../Services/train.service';
import { HttpClient } from '@angular/common/http';

describe('TrainComponent', () => {
  let component: TrainComponent;
  let fixture: ComponentFixture<TrainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainComponent,HttpClient], 
      providers: [TrainService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

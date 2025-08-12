import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolkadotTrackerComponent } from './polkadot-tracker.component';

describe('PolkadotTrackerComponent', () => {
  let component: PolkadotTrackerComponent;
  let fixture: ComponentFixture<PolkadotTrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolkadotTrackerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolkadotTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

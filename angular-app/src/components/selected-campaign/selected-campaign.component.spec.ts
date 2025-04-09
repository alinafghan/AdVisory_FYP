import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedCampaignComponent } from './selected-campaign.component';

describe('SelectedCampaignComponent', () => {
  let component: SelectedCampaignComponent;
  let fixture: ComponentFixture<SelectedCampaignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectedCampaignComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectedCampaignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

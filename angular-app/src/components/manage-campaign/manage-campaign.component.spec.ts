import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCampaignComponent } from './manage-campaign.component';

describe('ManageCampaignComponent', () => {
  let component: ManageCampaignComponent;
  let fixture: ComponentFixture<ManageCampaignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageCampaignComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageCampaignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCampaignPageComponent } from './create-campaign-page.component';

describe('CreateCampaignPageComponent', () => {
  let component: CreateCampaignPageComponent;
  let fixture: ComponentFixture<CreateCampaignPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCampaignPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateCampaignPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

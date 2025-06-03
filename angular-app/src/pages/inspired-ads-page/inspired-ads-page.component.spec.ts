import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InspiredAdsPageComponent } from './inspired-ads-page.component';

describe('InspiredAdsPageComponent', () => {
  let component: InspiredAdsPageComponent;
  let fixture: ComponentFixture<InspiredAdsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InspiredAdsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InspiredAdsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

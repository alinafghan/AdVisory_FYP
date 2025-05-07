import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CompetitorAdsComponent } from './competitor-ads.component';

describe('CompetitorAdsComponent', () => {
  let component: CompetitorAdsComponent;
  let fixture: ComponentFixture<CompetitorAdsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompetitorAdsComponent, HttpClientTestingModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CompetitorAdsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should get the correct social platform icon', () => {
    expect(component.getSocialPlatformIcon('instagram')).toBe('bi bi-instagram');
    expect(component.getSocialPlatformIcon('facebook')).toBe('bi bi-facebook');
    expect(component.getSocialPlatformIcon('linkedin')).toBe('bi bi-linkedin');
    expect(component.getSocialPlatformIcon('unknown')).toBe('bi bi-link-45deg');
  });
});
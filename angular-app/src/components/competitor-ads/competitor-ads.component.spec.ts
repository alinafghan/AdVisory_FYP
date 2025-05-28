import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { CompetitorAdsComponent } from './competitor-ads.component';

describe('CompetitorAdsComponent', () => {
  let component: CompetitorAdsComponent;
  let fixture: ComponentFixture<CompetitorAdsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompetitorAdsComponent, HttpClientTestingModule, FormsModule]
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

  it('should not fetch ads if keywords is empty', () => {
    const httpSpy = spyOn(component['http'], 'post').and.callThrough();
    
    component.keywords = '';
    component.fetchAds();
    
    expect(httpSpy).not.toHaveBeenCalled();
    expect(component.error).toBe('Please enter a keyword to search for ads');
  });

  it('should set error to null when fetching ads', () => {
    const httpSpy = spyOn(component['http'], 'post').and.returnValue({
      subscribe: () => {}
    } as any);
    
    component.error = 'Previous error';
    component.keywords = 'test';
    component.fetchAds();
    
    expect(component.error).toBeNull();
    expect(httpSpy).toHaveBeenCalled();
  });
});
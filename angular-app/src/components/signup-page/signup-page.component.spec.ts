// signup-page.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignupPageComponent } from './signup-page.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';

describe('SignupPageComponent', () => {
  let component: SignupPageComponent;
  let fixture: ComponentFixture<SignupPageComponent>;
  let httpTestingController: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SignupPageComponent ],
      imports: [
        HttpClientModule,
        RouterTestingModule,
        FormsModule,
        HttpClientTestingModule,
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignupPageComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should submit the form with valid data', () => {
    component.username = 'testuser';
    component.email = 'testuser@example.com';
    component.businessName = 'Test Business';
    component.businessType = 'Retail';
    component.firstName = 'Test';
    component.password = 'password123';
    const mockFile = new File([''], 'logo.png', { type: 'image/png' });
    component.selectedLogo = mockFile;

    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
    submitButton.nativeElement.click();

    const req = httpTestingController.expectOne('http://localhost:3000/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.has('username')).toBeTruthy();
    expect(req.request.body.has('email')).toBeTruthy();
    expect(req.request.body.has('businessName')).toBeTruthy();
    expect(req.request.body.has('businessType')).toBeTruthy();
    expect(req.request.body.has('firstName')).toBeTruthy();
    expect(req.request.body.has('password')).toBeTruthy();
    expect(req.request.body.has('businessLogo')).toBeTruthy();

    req.flush({ message: 'Registration successful' });

    // Check if we navigate to the next page
    expect(router.navigate).toHaveBeenCalledWith(['/business-info']);
  });

  it('should show an error message if the registration fails', () => {
    const spy = spyOn(window, 'alert');
    component.username = 'testuser';
    component.email = 'testuser@example.com';
    component.businessName = 'Test Business';
    component.businessType = 'Retail';
    component.firstName = 'Test';
    component.password = 'password123';
    const mockFile = new File([''], 'logo.png', { type: 'image/png' });
    component.selectedLogo = mockFile;

    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
    submitButton.nativeElement.click();

    const req = httpTestingController.expectOne('http://localhost:3000/auth/register');
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'Signup failed' }, { status: 400, statusText: 'Bad Request' });

    expect(spy).toHaveBeenCalledWith('Signup failed. Please try again.');
  });

  afterEach(() => {
    httpTestingController.verify();
  });
});

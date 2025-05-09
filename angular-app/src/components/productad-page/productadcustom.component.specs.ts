import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductAdCustomComponent } from './productadcustom.component';

describe('ProductAdCustomComponent', () => {
  let component: ProductAdCustomComponent;
  let fixture: ComponentFixture<ProductAdCustomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductAdCustomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductAdCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

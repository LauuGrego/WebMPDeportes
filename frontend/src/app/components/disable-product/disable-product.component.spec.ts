import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisableProductComponent } from './disable-product.component';

describe('DisableProductComponent', () => {
  let component: DisableProductComponent;
  let fixture: ComponentFixture<DisableProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisableProductComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisableProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

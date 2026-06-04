import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { of } from 'rxjs';

import { ApiService } from '../services/api.service';

import { ContributePage } from './contribute.page';

describe('ContributePage', () => {
  let component: ContributePage;
  let fixture: ComponentFixture<ContributePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContributePage],
      imports: [IonicModule.forRoot()],
      providers: [
        {
          provide: ApiService,
          useValue: {
            getContributions: () => of([]),
            submitContribution: () => of({}),
            resolveBackendUrl: (url: string) => url
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ContributePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

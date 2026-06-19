import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get activities with correct headers and params', () => {
    const mockResponse = { success: true, data: { data: [], total: 0, limit: 10, offset: 0 } };
    service.getActivities({ limit: 10 }).subscribe((res) => {
      expect(res.success).toBeTrue();
      expect(res.data.total).toBe(0);
    });

    const req = httpMock.expectOne((r) => r.url === `${environment.apiUrl}/activities`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('limit')).toBe('10');
    expect(req.request.headers.has('X-Session-Id')).toBeTrue();
    req.flush(mockResponse);
  });

  it('should create an activity with POST method', () => {
    const mockActivity = { id: 1, type: 'transport', sub_type: 'car', value: 10, unit: 'km', co2e: 2.1, date: '2026-06-19' };
    const mockResponse = { success: true, data: mockActivity };
    const dto = { type: 'transport' as any, sub_type: 'car', value: 10, unit: 'km', date: '2026-06-19' };

    service.createActivity(dto).subscribe((res) => {
      expect(res.success).toBeTrue();
      expect(res.data.id).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/activities`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush(mockResponse);
  });

  it('should delete an activity with DELETE method', () => {
    const mockResponse = { success: true, data: undefined };

    service.deleteActivity(1).subscribe((res) => {
      expect(res.success).toBeTrue();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/activities/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });

  it('should retrieve dashboard stats', () => {
    const mockResponse = { success: true, data: {} as any };

    service.getDashboard().subscribe((res) => {
      expect(res.success).toBeTrue();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/dashboard`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});

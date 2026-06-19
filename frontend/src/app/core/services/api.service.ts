import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Activity, CreateActivityDto, ActivityListResponse, ActivitySubType, ActivityType } from '../models/activity.model';
import { DashboardData } from '../models/dashboard.model';
import { InsightsData, GamificationData } from '../models/gamification.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private get headers(): HttpHeaders {
    const sessionId = this.getOrCreateSessionId();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Session-Id': sessionId,
    });
  }

  private getOrCreateSessionId(): string {
    let sessionId = localStorage.getItem('ecotrack_session_id');
    if (!sessionId) {
      sessionId = this.generateSessionId();
      localStorage.setItem('ecotrack_session_id', sessionId);
    }
    return sessionId;
  }

  private generateSessionId(): string {
    return 'sess-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
  }

  // ─── Activities ───────────────────────────────────────────────────────────

  createActivity(dto: CreateActivityDto): Observable<ApiResponse<Activity>> {
    return this.http.post<ApiResponse<Activity>>(
      `${this.baseUrl}/activities`,
      dto,
      { headers: this.headers }
    );
  }

  getActivities(params?: {
    type?: ActivityType;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Observable<ApiResponse<ActivityListResponse>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined) httpParams = httpParams.set(key, String(val));
      });
    }
    return this.http.get<ApiResponse<ActivityListResponse>>(
      `${this.baseUrl}/activities`,
      { headers: this.headers, params: httpParams }
    );
  }

  deleteActivity(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/activities/${id}`,
      { headers: this.headers }
    );
  }

  getSubTypes(type: ActivityType): Observable<ApiResponse<ActivitySubType[]>> {
    return this.http.get<ApiResponse<ActivitySubType[]>>(
      `${this.baseUrl}/activities/sub-types/${type}`,
      { headers: this.headers }
    );
  }

  // ─── Dashboard ────────────────────────────────────────────────────────────

  getDashboard(): Observable<ApiResponse<DashboardData>> {
    return this.http.get<ApiResponse<DashboardData>>(
      `${this.baseUrl}/dashboard`,
      { headers: this.headers }
    );
  }

  // ─── Insights ─────────────────────────────────────────────────────────────

  getInsights(): Observable<ApiResponse<InsightsData>> {
    return this.http.get<ApiResponse<InsightsData>>(
      `${this.baseUrl}/insights`,
      { headers: this.headers }
    );
  }

  // ─── Analytics ────────────────────────────────────────────────────────────

  getAnalytics(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/analytics`,
      { headers: this.headers }
    );
  }

  // ─── Achievements ─────────────────────────────────────────────────────────

  getAchievements(): Observable<ApiResponse<GamificationData>> {
    return this.http.get<ApiResponse<GamificationData>>(
      `${this.baseUrl}/achievements`,
      { headers: this.headers }
    );
  }

  // ─── Goals ───────────────────────────────────────────────────────────────

  getGoal(): Observable<ApiResponse<{ target_kg_per_day: number; start_date: string } | null>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/goals`,
      { headers: this.headers }
    );
  }

  setGoal(targetKgPerDay: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/goals`,
      { target_kg_per_day: targetKgPerDay },
      { headers: this.headers }
    );
  }
}

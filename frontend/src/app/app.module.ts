import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

// Chart.js
import { NgChartsModule } from 'ng2-charts';

// App
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpErrorInterceptor } from './core/interceptors/http-error.interceptor';

// Layout
import { LayoutComponent } from './shared/components/layout/layout.component';

// Feature Components
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ActivityLogComponent } from './features/activity-log/activity-log.component';
import { InsightsComponent } from './features/insights/insights.component';
import { AnalyticsComponent } from './features/analytics/analytics.component';
import { AchievementsComponent } from './features/achievements/achievements.component';

// Shared Components
import { KpiCardComponent } from './features/dashboard/kpi-card/kpi-card.component';
import { TrendChartComponent } from './features/dashboard/trend-chart/trend-chart.component';
import { CarbonGaugeComponent } from './features/dashboard/carbon-gauge/carbon-gauge.component';
import { ActivityFormComponent } from './features/activity-log/activity-form/activity-form.component';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from './shared/components/empty-state/empty-state.component';

// Pipes
import { ActiveLabelPipe } from './shared/pipes/active-label.pipe';

const MATERIAL_MODULES = [
  MatToolbarModule, MatSidenavModule, MatListModule, MatIconModule, MatButtonModule,
  MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
  MatDatepickerModule, MatNativeDateModule, MatProgressBarModule,
  MatProgressSpinnerModule, MatChipsModule, MatTooltipModule, MatSnackBarModule,
  MatDialogModule, MatTabsModule, MatBadgeModule, MatMenuModule,
  MatDividerModule, MatSlideToggleModule,
];

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    DashboardComponent,
    ActivityLogComponent,
    InsightsComponent,
    AnalyticsComponent,
    AchievementsComponent,
    KpiCardComponent,
    TrendChartComponent,
    CarbonGaugeComponent,
    ActivityFormComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ActiveLabelPipe,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
    NgChartsModule,
    ...MATERIAL_MODULES,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

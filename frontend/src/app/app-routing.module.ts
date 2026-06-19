import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ActivityLogComponent } from './features/activity-log/activity-log.component';
import { InsightsComponent } from './features/insights/insights.component';
import { AnalyticsComponent } from './features/analytics/analytics.component';
import { AchievementsComponent } from './features/achievements/achievements.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, title: 'Dashboard – EcoTrack AI' },
  { path: 'activity-log', component: ActivityLogComponent, title: 'Activity Log – EcoTrack AI' },
  { path: 'insights', component: InsightsComponent, title: 'AI Insights – EcoTrack AI' },
  { path: 'analytics', component: AnalyticsComponent, title: 'Analytics – EcoTrack AI' },
  { path: 'achievements', component: AchievementsComponent, title: 'Achievements – EcoTrack AI' },
  { path: '**', redirectTo: 'dashboard' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}

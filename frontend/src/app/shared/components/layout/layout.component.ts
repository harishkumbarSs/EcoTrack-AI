import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router, NavigationEnd } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { filter } from 'rxjs/operators';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  ariaLabel: string;
}

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  isDark = false;
  currentRoute = '';

  navItems: NavItem[] = [
    { path: '/dashboard',    label: 'Dashboard',    icon: 'dashboard',   ariaLabel: 'Go to Dashboard' },
    { path: '/activity-log', label: 'Activity Log', icon: 'edit_note',   ariaLabel: 'Go to Activity Log' },
    { path: '/insights',     label: 'AI Insights',  icon: 'auto_awesome', ariaLabel: 'Go to AI Insights' },
    { path: '/analytics',    label: 'Analytics',    icon: 'bar_chart',   ariaLabel: 'Go to Analytics' },
    { path: '/achievements', label: 'Achievements', icon: 'emoji_events', ariaLabel: 'Go to Achievements' },
  ];

  constructor(
    public themeService: ThemeService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.isDark = this.themeService.isDark;
    this.themeService.theme$.subscribe((t) => (this.isDark = t === 'dark'));

    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.currentRoute = (e as NavigationEnd).urlAfterRedirects;
      });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  isActive(path: string): boolean {
    return this.currentRoute.startsWith(path);
  }
}

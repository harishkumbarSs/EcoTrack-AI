import { Pipe, PipeTransform } from '@angular/core';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  ariaLabel: string;
}

@Pipe({
  name: 'activeLabel',
})
export class ActiveLabelPipe implements PipeTransform {
  transform(navItems: NavItem[], currentRoute: string): string {
    if (!navItems || !currentRoute) return 'EcoTrack AI';
    const activeItem = navItems.find((item) => currentRoute.startsWith(item.path));
    return activeItem ? activeItem.label : 'EcoTrack AI';
  }
}

import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../Services/AuthService/auth.service';
import { LaunchAccessService } from '../../Services/launch-access.service';
import { NavigationGroup, NavigationItem, navigationConfig } from '../../navigation/navigation.config';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);
  private readonly launchAccessService = inject(LaunchAccessService);
  private readonly router = inject(Router);

  readonly groups = navigationConfig;
  readonly openGroups = signal<Record<string, boolean>>({});
  readonly launchingItinerary = signal(false);

  private readonly userPermissions = this.authService.getPermisions();
  private readonly currentUrl = signal(this.router.url);

  readonly visibleGroups = computed(() =>
    this.groups
      .filter((group) => this.canAccess(group.permissions))
      .map((group) => ({
        ...group,
        items: this.getVisibleItems(group),
      }))
      .filter((group) => group.items.length > 0)
  );

  @Input() isOpen = true;
  @Output() closeSidebar = new EventEmitter<void>();

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects);
        this.expandActiveGroup();
      });

    // Keep the active module expanded while allowing manual collapse on the others.
    effect(() => {
      this.visibleGroups();
      this.currentUrl();
      this.expandActiveGroup();
    }, { allowSignalWrites: true });
  }

  toggleGroup(groupId: string): void {
    this.openGroups.update((groups) => ({
      ...groups,
      [groupId]: !groups[groupId],
    }));
  }

  isGroupOpen(groupId: string): boolean {
    return this.openGroups()[groupId] ?? false;
  }

  isGroupActive(group: NavigationGroup): boolean {
    return group.items.some((item) => this.isItemActive(item));
  }

  isItemActive(item: NavigationItem): boolean {
    const currentUrl = this.normalizeRoute(this.currentUrl());
    const routesToMatch = item.matchRoutes?.length ? item.matchRoutes : item.route ? [item.route] : [];

    return routesToMatch.some((route) => {
      const normalizedRoute = this.normalizeRoute(route);
      return currentUrl === normalizedRoute || currentUrl.startsWith(`${normalizedRoute}/`);
    });
  }

  trackByGroup(_: number, group: NavigationGroup): string {
    return group.id;
  }

  trackByItem(_: number, item: NavigationItem): string {
    return item.id;
  }

  async handleItem(item: NavigationItem): Promise<void> {
    if (item.action === 'openItineraryBuilder') {
      await this.openItineraryBuilder();
    }
  }

  onCloseSidebar(): void {
    this.closeSidebar.emit();
  }

  async openItineraryBuilder(): Promise<void> {
    if (this.launchingItinerary()) {
      return;
    }

    try {
      this.launchingItinerary.set(true);
      await this.launchAccessService.openItineraryBuilder();
    } catch (error) {
      console.error('Error opening itinerary builder:', error);
      alert('Could not open Itinerary Builder. Please try again.');
    } finally {
      this.launchingItinerary.set(false);
    }
  }

  private getVisibleItems(group: NavigationGroup): NavigationItem[] {
    return group.items.filter((item) => this.canAccess(item.permissions));
  }

  private canAccess(requiredPermissions?: string[]): boolean {
    if (!requiredPermissions?.length) {
      return true;
    }

    return requiredPermissions.every((permission) => this.userPermissions.includes(permission));
  }

  private expandActiveGroup(): void {
    const activeGroups = this.visibleGroups()
      .filter((group) => this.isGroupActive(group))
      .reduce<Record<string, boolean>>((acc, group) => {
        acc[group.id] = true;
        return acc;
      }, {});

    if (Object.keys(activeGroups).length === 0) {
      return;
    }

    this.openGroups.update((groups) => ({
      ...groups,
      ...activeGroups,
    }));
  }

  private normalizeRoute(route: string): string {
    return route.replace(/^\/+/, '').replace(/^dashboard\//, '');
  }
}

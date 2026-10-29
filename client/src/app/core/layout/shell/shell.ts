import { Component, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { SidebarMenu } from '../sidebar-menu/sidebar-menu';
import { Topbar } from '../topbar/topbar';

/**
 * Giriş gerektiren bütün sayfaların kabuğu: solda menü, üstte topbar, ortada sayfa (router-outlet).
 * Login ve 404 dışındaki her sayfa bunun çocuğudur (app.routes.ts).
 */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, NzLayoutModule, SidebarMenu, Topbar],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell {
  /** Dar ekranlarda menü otomatik kapanır (nzBreakpoint). */
  protected readonly collapsed = signal(false);
}

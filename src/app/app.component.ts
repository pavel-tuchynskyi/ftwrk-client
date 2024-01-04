import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <app-notify></app-notify>
    <app-loader></app-loader>
    <router-outlet></router-outlet>
    <app-error-handler>
  `,
  styles: []
})
export class AppComponent {
  title = 'ftwrk-client';
}

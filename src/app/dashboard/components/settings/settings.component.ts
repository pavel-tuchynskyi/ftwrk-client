import { Component } from "@angular/core";

@Component({
    selector: 'app-settings',
    template: `
        <app-navbar></app-navbar>
        <app-profile-nav></app-profile-nav>
        <router-outlet></router-outlet>
    `
})
export class SettingsComponent{}
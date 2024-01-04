import { Component } from "@angular/core";
import { AccountService } from "src/app/core/services/account.service";

@Component({
    selector: 'app-home',
    template: `
        <app-navbar></app-navbar>
        <app-left-menu></app-left-menu>
        <router-outlet></router-outlet>
        <app-player></app-player>
    `,
    providers: [AccountService]
})
export class HeaderComponent{
    constructor(){}
}
import { Component } from "@angular/core";
import { AccountService } from "../../../core/services/account.service";

@Component({
    selector: 'app-external',
    templateUrl: './external-signin.component.html',
    styleUrls: ['./external-signin.component.scss']
})
export class ExtenralSignInComponent{
    constructor(private accountService: AccountService){}

    loginWithFacebook() {
        this.accountService.signInWithFacebook();
    }
}
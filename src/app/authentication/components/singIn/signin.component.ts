import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router  } from '@angular/router';
import { HttpResponse } from "src/app/core/models/http-response";
import { ErrorHandlingService } from "src/app/core/services/error-handling.service";
import { UserSignIn } from "../../models/user-signin";
import { AccountService } from "../../../core/services/account.service";
import { UserToken } from "../../models/user-token";

@Component({
    selector: 'app-signin',
    templateUrl: './signin.component.html',
    styleUrls: ['./signin.component.scss'],
    providers: [AccountService]
})
export class SignInComponent implements OnInit{
    signInForm!: FormGroup;

    constructor(private router: Router, private accountService: AccountService, private errorService: ErrorHandlingService) { }

    ngOnInit(): void {
        this.signInForm = new FormGroup({
            email: new FormControl('', [ Validators.required, Validators.email ]),
            password: new FormControl('', [ Validators.required, Validators.minLength(8), Validators.maxLength(30) ])
        })
    }

    signIn() {
        const user = this.signInForm.value as UserSignIn;
        this.accountService.signIn(user);
    }
}
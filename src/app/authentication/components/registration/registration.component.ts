import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { HttpResponse } from "src/app/core/models/http-response";
import { ErrorHandlingService } from "src/app/core/services/error-handling.service";
import { AccountService } from "../../../core/services/account.service";
import { UserRegister } from "../../models/user-register";
import { UserToken } from "../../models/user-token";

@Component({
    selector: 'app-registration',
    templateUrl: './registration.component.html',
    styleUrls: ['./registration.component.scss'],
    providers: [ AccountService ]
})
export class RegistrationComponent implements OnInit{
    registrationForm!: FormGroup;

    constructor(private accountService: AccountService, private router: Router, private errorService: ErrorHandlingService){}

    ngOnInit(): void {
        this.registrationForm = new FormGroup({
            userName: new FormControl('', [ Validators.required, Validators.maxLength(30) ]),
            fullName: new FormControl('', [ Validators.required, Validators.maxLength(30) ]),
            email: new FormControl('', [ Validators.required, Validators.email ]),
            country: new FormControl('', [ Validators.required ]),
            age: new FormControl([ Validators.required, Validators.min(5), Validators.max(100) ]),
            password: new FormControl('', [ Validators.required, Validators.minLength(8), Validators.maxLength(30) ])
        });
    }
    
    submit(){
        const user = this.registrationForm.value as UserRegister;
        this.accountService.signUp(user).subscribe({
            next: (response: HttpResponse<UserToken>) => {
                this.accountService.setToken(response.data);
            },
            error: (response) => this.errorService.setError(response.error.exception.message),
            complete: () => this.router.navigate(['/pick-role'])
        });
    }
}
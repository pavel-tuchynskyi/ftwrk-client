import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ErrorHandlingService } from "src/app/core/services/error-handling.service";
import { AccountService } from "../../../core/services/account.service";
import { ForgotPassword } from "../../models/forgot-password";

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss'],
    providers: [AccountService]
})
export class ForgotPasswordComponent implements OnInit{
    forgetPasswordForm!: FormGroup;
    showMessage: boolean = false;
    constructor(private accountService: AccountService, private errorService: ErrorHandlingService){}

    ngOnInit(): void {
        this.forgetPasswordForm = new FormGroup({
            email: new FormControl('', [Validators.required, Validators.email])
        });
    }

    submit(){
        var email = this.forgetPasswordForm.value.email as string;
        this.accountService.forgotPassword(email).subscribe({
            error: (response) => this.errorService.setError(response.error.exception.message),
            complete: () => this.showMessage = true
        });
    }
}
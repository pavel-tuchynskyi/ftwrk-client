import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ErrorHandlingService } from "src/app/core/services/error-handling.service";
import { AccountService } from "../../../core/services/account.service";
import { ResetPassword } from "../../models/reset-password";

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss'],
    providers: [AccountService]
})
export class ResetPasswordComponent implements OnInit{
    private code!: string;
    private email!: string;
    resetPasswordForm!: FormGroup;

    constructor(private route: ActivatedRoute, private router: Router, private accountService: AccountService, private errorService: ErrorHandlingService){}

    ngOnInit(): void {
        this.resetPasswordForm = new FormGroup({
            password: new FormControl('', [ Validators.required, Validators.minLength(8), Validators.maxLength(30) ]),
            confirmPassword: new FormControl('', [ Validators.required, Validators.minLength(8), Validators.maxLength(30) ])
        });

        this.resetPasswordForm.valueChanges.subscribe(frm => {
            const password = frm.password;
            const confirm = frm.confirmPassword;

            if (password !== confirm) {
              this.resetPasswordForm.get('confirmPassword')!.setErrors({ notMatched: true });
            }
            else {
              this.resetPasswordForm.get('confirmPassword')!.setErrors(null);
            }
        });

        this.code = this.route.snapshot.queryParams['code'];
        this.email = this.route.snapshot.queryParams['email'];
    }

    submit(){
        var password = this.resetPasswordForm.get('confirmPassword')?.value;
        var resetPassword = new ResetPassword(this.email, password, this.code);
        this.accountService.resetUserPassword(resetPassword).subscribe({
            error: (response) => this.errorService.setError(response.error.exception.message),
            complete: () => this.router.navigate(['login'])
        })
    }
}
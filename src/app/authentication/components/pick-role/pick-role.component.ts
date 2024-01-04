import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AccountService } from "src/app/core/services/account.service";
import { ErrorHandlingService } from "src/app/core/services/error-handling.service";

@Component({
    selector: 'app-pick-role',
    templateUrl: './pick-role.component.html',
    styleUrls: ['./pick-role.component.scss'],
    providers: [AccountService]
})
export class PickRoleComponent implements OnInit{
    roleForm!: FormGroup;
    constructor(private accountService: AccountService, private router: Router, private errorService: ErrorHandlingService){}

    ngOnInit(): void {
        this.roleForm = new FormGroup({
            role: new FormControl('User', [Validators.required])
        });
    }

    submit(){
        var role = this.roleForm.value.role;
        this.accountService.addUserToRole(role).subscribe({
            next: (response) => {
                this.accountService.setToken(response.data);
            },
            error: (response) => this.errorService.setError(response.error.exception.message),
            complete: () => this.router.navigate(['/'])
        });
    }
}
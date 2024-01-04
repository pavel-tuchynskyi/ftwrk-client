import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../core/services/auth-guard.service";
import { ForgotPasswordComponent } from "./components/forgor-password/forgot-password.component";
import { PickRoleComponent } from "./components/pick-role/pick-role.component";
import { RegistrationComponent } from "./components/registration/registration.component";
import { ResetPasswordComponent } from "./components/reset-password/reset-password.component";
import { SignInComponent } from "./components/singIn/signin.component";

const routes: Routes = [
    { path: "login", component: SignInComponent },
    { path: "registration", component: RegistrationComponent },
    { path: "forgot-password", component: ForgotPasswordComponent },
    { path: "reset-password", component: ResetPasswordComponent },
    { path: "pick-role", component: PickRoleComponent }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    providers: [
        AuthGuard
    ],
    exports: [RouterModule]
})
export class AuthenticationRoutingModule {}
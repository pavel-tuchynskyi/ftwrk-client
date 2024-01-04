import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AppRoutingModule } from "../app-routing.module";
import { HttpClientModule } from '@angular/common/http';
import { SocialLoginModule, SocialAuthServiceConfig, FacebookLoginProvider } from '@abacritt/angularx-social-login';
import { GoogleLoginProvider } from '@abacritt/angularx-social-login';
import { CommonModule } from "@angular/common";
import { SignInComponent } from "./components/singIn/signin.component";
import { RegistrationComponent } from "./components/registration/registration.component";
import { ExtenralSignInComponent } from "./components/external-signin/external-signin.component";
import { ResetPasswordComponent } from "./components/reset-password/reset-password.component";
import { ForgotPasswordComponent } from "./components/forgor-password/forgot-password.component";
import { AuthenticationRoutingModule } from "./authentication-routing.module";
import { PickRoleComponent } from "./components/pick-role/pick-role.component";

@NgModule({
    declarations: [
        SignInComponent,
        RegistrationComponent,
        ExtenralSignInComponent,
        ResetPasswordComponent,
        ForgotPasswordComponent,
        PickRoleComponent
    ],
    imports: [
        AppRoutingModule,
        FormsModule,
        HttpClientModule,
        SocialLoginModule,
        ReactiveFormsModule,
        AuthenticationRoutingModule,
        CommonModule
    ],
    exports: [
        SignInComponent,
        RegistrationComponent,
        ExtenralSignInComponent,
        ResetPasswordComponent,
        ForgotPasswordComponent,
        PickRoleComponent
    ],
    providers: [
        {
            provide: 'SocialAuthServiceConfig',
            useValue: {
              autoLogin: false,
              providers: [
                {
                  id: GoogleLoginProvider.PROVIDER_ID,
                  provider: new GoogleLoginProvider('379160406995-qv2hbubcl2i9r8fifam8q13lr7d9mdsj.apps.googleusercontent.com')
                },
                {
                  id: FacebookLoginProvider.PROVIDER_ID,
                  provider: new FacebookLoginProvider('577216201078847')
                }
              ],
              onError: (err) => {
                console.error(err);
              }
            } as SocialAuthServiceConfig
        }
    ]
})
export class AuthenticationModule {}
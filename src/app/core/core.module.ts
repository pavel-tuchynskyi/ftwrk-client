import { NgModule } from "@angular/core";
import { JwtModule } from "@auth0/angular-jwt";
import { ErrorHandlerComponent } from "./components/error/error-handler.component";
import { AuthGuard, signInConstants } from "./services/auth-guard.service";
import { LoaderComponent } from "./components/loader/loader.component";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { LoadingInterceptor } from "./interceptors/loading.interceptor";
import { CommonModule } from "@angular/common";
import { NotificationComponent } from "./components/notification/notification.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';


export function tokenGetter() {
    return localStorage.getItem(signInConstants.accessTokenKey);
}
  
const allowedDomains = ["localhost:7244"];

@NgModule({
    imports: [
        JwtModule.forRoot({
            config: {
              tokenGetter: tokenGetter,
              allowedDomains: allowedDomains,
              disallowedRoutes: []
            }
        }),
        CommonModule,
        BrowserAnimationsModule,
        MatProgressSpinnerModule
    ],
    declarations: [
        NotificationComponent,
        ErrorHandlerComponent,
        LoaderComponent
    ],
    providers: [
        AuthGuard,
        {
            provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true
        }
    ],
    exports: [
        ErrorHandlerComponent,
        LoaderComponent,
        NotificationComponent
    ]
})
export class CoreModule {}
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { CanActivate, Router} from "@angular/router";
import { JwtHelperService } from "@auth0/angular-jwt";
import { UserToken } from "src/app/authentication/models/user-token";
import { HttpResponse } from "../models/http-response";
import { UriBuilderService } from "./uribuilder.service";

export const signInConstants = {
    url: 'Account/SignIn',
    accessTokenKey: 'acceess-token',
    refreshTokenKey: 'refresh-token',
    nameClaim: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
    emailClaim: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
    roleClaim: 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
    idClaim: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
}

@Injectable()
export class AuthGuard implements CanActivate {
    private controller: string = "Account";

    constructor(private router: Router, private jwtHelper: JwtHelperService, private http: HttpClient, private uriBuilder: UriBuilderService){}

    async canActivate() {
        const token = localStorage.getItem(signInConstants.accessTokenKey);

        if (token && !this.jwtHelper.isTokenExpired(token)){
            return true;
        }

        const isRefreshSuccess = await this.tryRefreshingTokens(token!);

        if (!isRefreshSuccess) { 
            this.router.navigate(["login"]); 
        }

        const tokenObj = this.jwtHelper.decodeToken(token!);

        if(!tokenObj[signInConstants.roleClaim])
        {
            var email = tokenObj[signInConstants.emailClaim];
            this.router.navigate(['/pick-role', {
                email: email
        }]);
        }

        return isRefreshSuccess;
    }

    private async tryRefreshingTokens(token: string): Promise<boolean> {
        const refreshToken = localStorage.getItem(signInConstants.refreshTokenKey);
        
        if (!token || !refreshToken) { 
          return false;
        }
        
        const expiredTokens = new UserToken(token, refreshToken);

        let isRefreshSuccess: boolean;

        const refreshedTokens = await new Promise<HttpResponse<UserToken>>((resolve, reject) => {
            this.http.post<HttpResponse<UserToken>>(this.uriBuilder.createApiUri(this.controller, "RefreshToken"), expiredTokens)
            .subscribe({
                next: (res: HttpResponse<UserToken>) => resolve(res),
                error: (_) => { reject; isRefreshSuccess = false;}
            });
        });

        localStorage.setItem(signInConstants.accessTokenKey, refreshedTokens.data.accessToken);
        localStorage.setItem(signInConstants.refreshTokenKey, refreshedTokens.data.refreshToken);

        isRefreshSuccess = true;

        return isRefreshSuccess;
    }
}
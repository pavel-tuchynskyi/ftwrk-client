import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { JwtHelperService } from "@auth0/angular-jwt";
import { HttpResponse } from "src/app/core/models/http-response";
import { signInConstants } from "src/app/core/services/auth-guard.service";
import { UserRegister } from "../../authentication/models/user-register";
import { UserSignIn } from "../../authentication/models/user-signin";
import { UserToken } from "../../authentication/models/user-token";
import { FacebookLoginProvider, SocialAuthService, SocialUser } from "@abacritt/angularx-social-login";
import { UserExternalSignIn } from "../../authentication/models/user-external-signin";
import { Router } from "@angular/router";
import { UserProfile } from "../../dashboard/models/profile/user-profile";
import { UserEdit } from "../../dashboard/models/profile/user-edit";
import { UriBuilderService } from "src/app/core/services/uribuilder.service";
import { ResetPassword } from "../../authentication/models/reset-password";
import { UserPickRole } from "src/app/authentication/models/user-pick-role";
import { ErrorHandlingService } from "./error-handling.service";
import { UserPublicProfile } from "src/app/home/models/user-public-profile";


@Injectable()
export class AccountService {
    user: SocialUser | null;
    private controller: string = "Account";

    constructor(private http: HttpClient, private jwtHelper: JwtHelperService, private errorService: ErrorHandlingService,
        private externalAuthService: SocialAuthService, private router: Router, private uriBuilder: UriBuilderService){

        this.user = null;
        this.externalAuthService.authState.subscribe((user: SocialUser) => {
            if (user) {	
                this.extenralSignIn(user);
            }
            this.user = user;
        });
    }

    signIn(user: UserSignIn){
        return this.http.post<HttpResponse<UserToken>>(this.uriBuilder.createApiUri(this.controller, "SignIn"), user)
        .subscribe({
            next: (response: HttpResponse<UserToken>) => {
                this.handleTokenResponse(response.data);
            },
            error: (response) => this.errorService.setError(response.error.exception.message)
        });
    }

    signUp(user: UserRegister){
        return this.http.post<HttpResponse<UserToken>>(this.uriBuilder.createApiUri(this.controller, "Register"), user);
    }

    addUserToRole(role: string){
        const accessToken = localStorage.getItem(signInConstants.accessTokenKey);
        const refreshToken = localStorage.getItem(signInConstants.refreshTokenKey);
        let token = new UserToken(accessToken!, refreshToken!);
        var userRole = new UserPickRole(token, role)
        return this.http.post<HttpResponse<UserToken>>(this.uriBuilder.createApiUri(this.controller, "AddUserToRole"), userRole);
    }

    createExternalSignInInfo(user: SocialUser){
        var userInfo!:UserExternalSignIn;

        if(user.provider == "GOOGLE"){
            userInfo = new UserExternalSignIn(user.provider, user.idToken);
        }
        else if (user.provider == "FACEBOOK"){
            userInfo = new UserExternalSignIn(user.provider, user.authToken);
        }

        return userInfo;
    }

    extenralSignIn(user: SocialUser){
        var userInfo = this.createExternalSignInInfo(user);

        this.http.post<HttpResponse<UserToken>>(this.uriBuilder.createApiUri(this.controller, "ExternalLogin"), userInfo)
            .subscribe({
                next: (response: HttpResponse<UserToken>) => {
                    this.handleTokenResponse(response.data);
                },
                error: (response) => this.errorService.setError(response.error.exception.message)
            });	
    }

    handleTokenResponse(token: UserToken){
        const tokenObj = this.jwtHelper.decodeToken(token.accessToken);

        if(!tokenObj[signInConstants.roleClaim]){
            var email = tokenObj[signInConstants.emailClaim];
            this.router.navigate(["/pick-role"], { queryParams: {
                    email: email
                }});
            }
        else{
            this.setToken(token);
            this.router.navigate(["./"]);
        }
    }

    setToken(token: UserToken){
        localStorage.setItem(signInConstants.accessTokenKey, token.accessToken);
        localStorage.setItem(signInConstants.refreshTokenKey, token.refreshToken);
    }

    async signInWithFacebook() {
        await this.externalAuthService.signIn(FacebookLoginProvider.PROVIDER_ID);
    }

    signOut(){
        localStorage.removeItem(signInConstants.accessTokenKey);
        localStorage.removeItem(signInConstants.refreshTokenKey);
        this.router.navigate(['login']);
    }

    getUserProfile(){
        var id = this.getUserId();
        var httpParams = new HttpParams();
        httpParams = httpParams.set('id', id);
        return this.http.get<HttpResponse<UserProfile>>(this.uriBuilder.createApiUri(this.controller, "GetProfile"), { params: httpParams});
    }

    editUserProfile(user: UserEdit){
        var formData = new FormData();
        if(user.profilePicture){
            formData.set('ProfilePicture', user.profilePicture, user.profilePicture.name);
        }
        if(user.backgroundPicture){
            formData.set('BackgroundPicture', user.backgroundPicture, user.backgroundPicture.name);
        }
        formData.set('UserName', user.userName);
        formData.set('FullName', user.fullName);
        formData.set('Email', user.email);
        formData.set('Country', user.country);
        formData.set('Age', user.age.toString());

        return this.http.post<HttpResponse<UserToken>>(this.uriBuilder.createApiUri(this.controller, "EditProfile"), formData);
    }

    forgotPassword(email: string){
        var query = new Map<string, string>();
        query = query.set('email', email);
        return this.http.get(this.uriBuilder.createApiUri(this.controller, "ForgetPassword", query));
    }

    resetUserPassword(resetPassword: ResetPassword){
        return this.http.post(this.uriBuilder.createApiUri(this.controller, "ResetPassword"), resetPassword);
    }

    confirmEmail(){
        var email = this.getUserEmail() as string;
        var query = new Map<string, string>();
        query = query.set('email', email);
        return this.http.get(this.uriBuilder.createApiUri(this.controller, "SendConfirmationEmail", query));
    }

    isUserAuthenticated() {
        const token = localStorage.getItem(signInConstants.accessTokenKey);
        
        if (token && !this.jwtHelper.isTokenExpired(token)) {
            return true;
        }
        else {
            return false;
        }
    }

    getUserId(){
        const token = localStorage.getItem(signInConstants.accessTokenKey);

        if(token){
            const tokenObj = this.jwtHelper.decodeToken(token);
            const id = tokenObj[signInConstants.idClaim];
            return id;
        }
    }
        
    getUserName(){
        const token = localStorage.getItem(signInConstants.accessTokenKey);
        
        if(token){
            const tokenObj = this.jwtHelper.decodeToken(token);
            const userName = tokenObj[signInConstants.nameClaim];
            return userName;
        }
    }

    getUserEmail(){
        const token = localStorage.getItem(signInConstants.accessTokenKey);

        if(token){
            const tokenObj = this.jwtHelper.decodeToken(token);
            const email = tokenObj[signInConstants.emailClaim];
            return email;
        }
    }

    isUserArtist(){
        const token = localStorage.getItem(signInConstants.accessTokenKey);

        if(!token){
            return false;
        }

        const tokenObj = this.jwtHelper.decodeToken(token);
        const roles = tokenObj[signInConstants.roleClaim] as Array<string>;

        if(roles.includes('Artist')){
            return true;
        }
        else{
            return false;
        }
    }

    getPublicProfile(id: string){
        return this.http.get<HttpResponse<UserPublicProfile>>(this.uriBuilder.createApiUri(this.controller, `GetPublicProfile/${id}`));
    }
}
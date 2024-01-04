import { Component, OnInit } from "@angular/core";
import { HttpResponse } from "src/app/core/models/http-response";
import { ErrorHandlingService } from "src/app/core/services/error-handling.service";
import { UserProfile } from "../../models/profile/user-profile";
import { Image } from "../../models/image/image";
import { AccountService } from "../../../core/services/account.service";
import { ImageService } from "../../../core/services/image.service";

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss'],
    providers: [AccountService, ImageService]
})
export class UserProfileComponent implements OnInit{
    picture: any;
    profile?: UserProfile;
    showMessage: boolean = false;
    constructor(private accountService: AccountService, private imageService: ImageService, private errorService: ErrorHandlingService){}

    ngOnInit(): void {
        this.getProfile();
    }

    getProfile(){
        this.accountService.getUserProfile().subscribe({
            next: (response: HttpResponse<UserProfile>) => {
                this.profile = response.data;
                if(response.data.profilePicture){
                    this.picture = this.imageService.convertResponseToImage(response.data.profilePicture);
                }
            },
            error: (response) => this.errorService.setError(response.error.exception.message)
        });
    }

    confirmEmail(){
        this.accountService.confirmEmail().subscribe({
            error: (response) => this.errorService.setError(response.error.exception.message),
            complete: () => this.showMessage = true
        });
    }
}
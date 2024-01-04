import { Component, Input, OnInit } from "@angular/core";
import { HttpResponse } from "src/app/core/models/http-response";
import { ErrorHandlingService } from "src/app/core/services/error-handling.service";
import { Image } from "../../models/image/image";
import { AccountService } from "../../../core/services/account.service";
import { ImageService } from "../../../core/services/image.service";
import { FetchService } from "../../services/fetch.service";
import { UserProfile } from "../../models/profile/user-profile";

@Component({
    selector: 'app-profile-nav',
    templateUrl: './profile-nav.component.html',
    styleUrls: ['./profile-nav.component.scss'],
    providers: [AccountService, ImageService]
})
export class ProfileNavComponent implements OnInit{
    picture: any;

    constructor(private accountService: AccountService, private imageService: ImageService, private fetch: FetchService, private errorService: ErrorHandlingService){}

    ngOnInit(): void {
        this.fetch.getSubj().subscribe({
            next: (val) => {
                this.getProfile();
            }
        });

        this.getProfile();
    }

    getProfile(){
        this.accountService.getUserProfile().subscribe({
            next: (response: HttpResponse<UserProfile>) => {
                if(response.data.profilePicture){
                    this.picture = this.imageService.convertResponseToImage(response.data.profilePicture);
                }
            },
            error: (response) => this.errorService.setError(response.error.exception.message)
        });
    }
}
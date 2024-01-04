import { Component, OnInit } from "@angular/core";
import { HttpResponse } from "src/app/core/models/http-response";
import { ErrorHandlingService } from "src/app/core/services/error-handling.service";
import { AccountService } from "../../../core/services/account.service";
import { ImageService } from "../../../core/services/image.service";
import { FetchService } from "../../services/fetch.service";
import { UserProfile } from "../../models/profile/user-profile";
import { Router } from "@angular/router";

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
    providers: [AccountService, ImageService]
})
export class NavbarComponent implements OnInit {
    showSelect: boolean = false;
    picture: any;
    logo: any;
    profile!: UserProfile;

    constructor(public accountService: AccountService, private fetch: FetchService, private imageService: ImageService, 
        private errorService: ErrorHandlingService, private router: Router){}

    ngOnInit(): void {
        this.fetch.getSubj().subscribe({
            next: (val) => {
                this.getProfile();
            }
        });
        
        if(this.accountService.isUserAuthenticated()){
            this.getProfile();
            this.getLogo();
        }
    }

    getLogo(){
        this.imageService.getLogo().subscribe({
            next: (response) => {
                this.logo = this.createImageFromBlob(response);
            },
            error: (response) => this.errorService.setError(response.error.exception.message)
        });
    }

    createImageFromBlob(image: Blob) {
        let reader = new FileReader();
        reader.addEventListener("load", () => {
          this.logo = reader.result;
        }, false);
       
        if (image) {
          reader.readAsDataURL(image);
        }
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

    openProfile(){
        this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => this.router.navigate(['/profile', this.profile.id]));
    }

    openSettings(){
        this.router.navigate(['profile-overview']);
    }

    logOut(){
        this.showSelect = false;
        this.accountService.signOut();
    }
}
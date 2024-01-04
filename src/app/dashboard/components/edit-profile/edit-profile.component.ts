import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { HttpResponse } from "src/app/core/models/http-response";
import { ErrorHandlingService } from "src/app/core/services/error-handling.service";
import { UserEdit } from "../../models/profile/user-edit";
import { UserProfile } from "../../models/profile/user-profile";
import { UserToken } from "../../../authentication/models/user-token";
import { AccountService } from "../../../core/services/account.service";
import { ImageService } from "../../../core/services/image.service";
import { FetchService } from "../../services/fetch.service";

@Component({
    selector: 'app-edit-profile',
    templateUrl: './edit-profile.component.html',
    styleUrls: ['./edit-profile.component.scss'],
    providers: [AccountService, ImageService]
})
export class EditProfileComponent implements OnInit{
    picture!: any;
    newPicture: any;
    profilePicture!: File;
    background!: any;
    newBackground: any;
    backgroundFile!: File;
    profile?: UserProfile;
    editForm!: FormGroup;
    hasChange: boolean = false;
    
    constructor(private accountService: AccountService, private fetch: FetchService, private imageService: ImageService, private errorService: ErrorHandlingService){
        this.editForm = new FormGroup({
            userName: new FormControl('', [ Validators.required, Validators.maxLength(30), Validators.minLength(5) ]),
            fullName: new FormControl('', [ Validators.required, Validators.maxLength(30) ]),
            email: new FormControl('', [ Validators.required, Validators.email ]),
            country: new FormControl('', [ Validators.required ]),
            age: new FormControl('', [ Validators.required, Validators.min(5), Validators.max(100) ])
        });
    }

    ngOnInit(): void {
        this.fetchData();
    }

    fetchData(){
        this.getProfile();
    }

    patchEditForm(){
        this.editForm.setValue({
            userName: this.profile?.userName,
            fullName: this.profile?.fullName,
            email: this.profile?.email,
            country: this.profile?.country,
            age: this.profile?.age
        });
    }

    onCreateGroupFormValueChange(){
        const initialValue = this.editForm.value
        this.editForm.valueChanges.subscribe(value => {
          this.hasChange = Object.keys(initialValue).some(key => this.editForm.value[key] != initialValue[key])
        });
    }

    getProfile(){
        this.accountService.getUserProfile().subscribe({
            next: (response: HttpResponse<UserProfile>) => {
                this.profile = response.data;

                if(response.data.profilePicture){
                    this.picture = this.imageService.convertResponseToImage(response.data.profilePicture);
                }
                else{
                    this.picture = 'assets/img/profile-picture-default.jpg';
                }
                if(response.data.backgroundPicture){
                    this.background = this.imageService.convertResponseToImage(response.data.backgroundPicture);
                }
            },
            error: (response) => this.errorService.setError(response.error.exception.message),
            complete: () => {
                this.patchEditForm();
                this.onCreateGroupFormValueChange();
            }
        });
    }

    submit(){
        if(this.hasChange){
            var user = this.editForm.value as UserEdit;
            user.profilePicture = this.profilePicture
            user.backgroundPicture = this.backgroundFile;
            this.accountService.editUserProfile(user).subscribe({
                next: (response: HttpResponse<UserToken>) => {
                    this.accountService.setToken(response.data);
                },
                error: (response) => this.errorService.setError(response.error.exception.message),
                complete: () => {
                    this.fetchData();
                    this.fetch.setValue(true);
                }
            });
        }
    }

    uploadProfilePicture(event: Event){
        const target = event.target as HTMLInputElement;
        this.profilePicture = (target.files as FileList)[0];

        var reader = new FileReader();
        reader.onload = (event: any) => {
            this.newPicture = event.target.result;
        }
        reader.readAsDataURL(this.profilePicture);
        this.hasChange = true;
    }

    uploadBackground(event: Event){
        const target = event.target as HTMLInputElement;
        this.backgroundFile = (target.files as FileList)[0];

        var reader = new FileReader();
        reader.onload = (event: any) => {
            this.newBackground = event.target.result;
        }
        reader.readAsDataURL(this.backgroundFile);
        this.hasChange = true;
    }
}
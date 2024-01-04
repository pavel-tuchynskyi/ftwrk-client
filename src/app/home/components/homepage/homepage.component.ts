import { AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild } from "@angular/core";
import { RecommendationService } from "../../services/recommendations.service";
import { AlbumDetails } from "../../models/albums/album-details";
import { ErrorHandlingService } from "src/app/core/services/error-handling.service";
import { ImageService } from "src/app/core/services/image.service";
import { UserAlbum } from "../../models/albums/user-album";
import { AccountService } from "src/app/core/services/account.service";
import { UserProfile } from "src/app/dashboard/models/profile/user-profile";
import { SafeUrl } from "@angular/platform-browser";
import { Router } from "@angular/router";

@Component({
    selector: 'app-homepage',
    templateUrl: 'homepage.component.html',
    styleUrls: ['homepage.component.scss'],
    providers: [RecommendationService, ImageService, AccountService]
})
export class HomepageComponent implements OnInit, AfterViewInit{
    albums: UserAlbum[] = [];
    profile!: UserProfile;
    picture?: SafeUrl;

    @ViewChild('header', { read: ElementRef }) header!: ElementRef;

    constructor(private recommendations: RecommendationService, private errorService: ErrorHandlingService, private router: Router,
        private imageService: ImageService, private accountService: AccountService, private renderer: Renderer2){}
        
    ngAfterViewInit(): void {
        console.log(this.header);
    }

    ngOnInit(): void {
        this.getRecommendedAlbums();
        this.getProfile();
    }

    getRecommendedAlbums(){
        this.recommendations.getRecommendationAlbums().subscribe({
            next: (response) => {
                this.albums = response.data.map(x =>{
                    var poster = this.imageService.convertResponseToImage(x.poster);
                    return new UserAlbum(x.id, x.title, x.year, x.albumType, poster);
                })
            },
            error: (response) => this.errorService.setError(response.error.exception.message)
        });
    }

    getProfile(){
        this.accountService.getUserProfile().subscribe({
            next: (response) => {
                this.profile = response.data;
                if(response.data.profilePicture){
                    this.picture = this.imageService.convertResponseToImage(response.data.profilePicture);
                }

                if(response.data.backgroundPicture){
                    var background = this.imageService.convertResponseToImage(response.data.backgroundPicture);
                    this.setBackground(background);
                }
            },
            error: (response) => this.errorService.setError(response.error.exception.message)
        });
    }

    setBackground(url: any){
        this.renderer.setStyle(this.header.nativeElement, 'background-image', 'url('+ url.changingThisBreaksApplicationSecurity + ')');
    }

    openProfile(){
        this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => this.router.navigate(['/profile', this.profile.id]));
    }
}
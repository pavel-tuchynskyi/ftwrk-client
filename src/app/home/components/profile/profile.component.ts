import { AfterContentChecked, Component, ElementRef, OnInit, Renderer2, ViewChild } from "@angular/core";
import { SafeUrl } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { Filter, FilterCondition, FilterConditionType, Operators, QueryParameters } from "src/app/core/models/query-parameters";
import { AccountService } from "src/app/core/services/account.service";
import { ErrorHandlingService } from "src/app/core/services/error-handling.service";
import { ImageService } from "src/app/core/services/image.service";
import { UriBuilderService } from "src/app/core/services/uribuilder.service";
import { AlbumType } from "../../models/albums/album-type";
import { Playlist } from "../../models/playlists/playlist";
import { UserAlbum } from "../../models/albums/user-album";
import { AlbumService } from "../../services/album.service";
import { PlaylistService } from "../../services/playlist.service";

@Component({
    selector: 'app-profile',
    templateUrl: 'profile.component.html',
    styleUrls: ['profile.component.scss'],
    providers: [AlbumService, ImageService, AccountService, UriBuilderService, PlaylistService]
})
export class ProfileComponent implements OnInit, AfterContentChecked{
    fullName!: string;
    picture!: any;
    userAlbums!: UserAlbum[];
    id!: string;
    isOwner!: boolean;
    userPlaylists!: Playlist[];
    background!: string;
    backgroundPicture?: SafeUrl;

    @ViewChild('header') header!: ElementRef;

    constructor(private albumService: AlbumService, private imageService: ImageService, public accountService: AccountService,
        private errorService: ErrorHandlingService, private route: ActivatedRoute,
        private renderer: Renderer2, private router: Router, private playlistService: PlaylistService){}

    ngAfterContentChecked(): void {
        this.getBackgroundColor();
    }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.id = params['id'];
        });
        this.getProfile();
        this.getAlbums();
        this.getPlaylists();
    }

    getProfile(){
        this.accountService.getPublicProfile(this.id).subscribe({
            next: (response) => {
                this.fullName = response.data.fullName;

                if(response.data.profilePicture){
                    this.picture = this.imageService.convertResponseToImage(response.data.profilePicture);
                }

                if(response.data.id == this.accountService.getUserId() && this.accountService.isUserArtist()){
                    this.isOwner = true;
                }

                if(response.data.backgroundPicture.imageBytes.length > 0){
                    this.backgroundPicture = this.imageService.convertResponseToImage(response.data.backgroundPicture);
                }
            },
            error: (response) => this.errorService.setError(response.error.exception.message),
            complete: () => {
                if(this.backgroundPicture){
                    this.setBackground(this.backgroundPicture);
                    this.ngAfterContentChecked();
                }
            }
        });
    }

    getAlbums(){
        var filterArr: FilterCondition[] = [];
        filterArr.push(new FilterCondition("CreatorId", FilterConditionType.Equal, this.id));
        var filter = new Filter(Operators.And, filterArr);
        var params = new QueryParameters(filter, "Year desc", 1, 6);
        this.albumService.getAlbums(params).subscribe({
            next: (response) => {
                this.userAlbums = response.data.items.map(x =>{
                    var poster = this.imageService.convertResponseToImage(x.poster);
                    return new UserAlbum(x.id, x.title, x.year, x.albumType, poster);
                })
            },
            error: (response) => this.errorService.setError(response.error.exception.message)
        })
    }

    setBackground(url: any){
        this.renderer.setStyle(this.header.nativeElement, 'background-image', 'url('+ url.changingThisBreaksApplicationSecurity + ')');
    }

    getAlbumTypeName(type: AlbumType){
        return this.albumService.getAlbumTypeName(type);
    }

    showAlbums(){
        this.router.navigate([`albums`], {relativeTo: this.route});
    }

    albumDetails(albumId: string){
        this.router.navigate([`albums/${albumId}`]);
    }

    getPlaylists(){
        var filterArr: FilterCondition[] = [
            new FilterCondition("OwnerId", FilterConditionType.Equal, this.id),
            new FilterCondition("IsCustom", FilterConditionType.Equal, true)
        ];
        var filter = new Filter(Operators.And, filterArr);
        var params = new QueryParameters(filter, "Title desc", 1, 6);
        this.playlistService.getPlaylists(params).subscribe({
            next: (response) => {
                this.userPlaylists = response.data.items.map(x =>{
                    if(x.poster){
                        x.poster = this.imageService.convertResponseToImage(x.poster);
                    }
                    return new Playlist(x.id, x.title, x.poster, x.isCustom);
                })
            },
            error: (response) => this.errorService.setError(response.error.exception.message)
        })
    }

    showPlaylists(){
        this.router.navigate([`playlists`], {relativeTo: this.route});
    }

    playlistDetails(playlistId: string){
        this.router.navigate([`playlists/${playlistId}`]);
    }

    getBackgroundColor(){
        let pic = document.getElementById('pic');
        let src = pic!.style.backgroundImage.slice(4, -1).replace(/"/g, "");
        let image = new Image;
        image.src = src;
        if(image.complete){
            let avg = this.imageService.getAverageRGB(image);
            if(avg.r > this.imageService.defaultRGB.r && avg.g > this.imageService.defaultRGB.g && avg.b > this.imageService.defaultRGB.b){
                avg = this.imageService.defaultRGB;
            }
            this.background = `linear-gradient(rgb(${avg.r},${avg.g},${avg.b}) 10%, rgb(0, 0, 0))`;
        }
    }
}
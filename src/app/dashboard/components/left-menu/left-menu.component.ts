import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { Filter, FilterCondition, FilterConditionType, Operators, QueryParameters } from "src/app/core/models/query-parameters";
import { AccountService } from "src/app/core/services/account.service";
import { ErrorHandlingService } from "src/app/core/services/error-handling.service";
import { Playlist } from "../../../home/models/playlists/playlist";
import { PlaylistService } from "../../../home/services/playlist.service";

@Component({
    selector: 'app-left-menu',
    templateUrl: 'left-menu.component.html',
    styleUrls: ['left-menu.component.scss'],
    providers: [AccountService]
})
export class LeftMenuComponent implements OnInit{
    isArtist!: boolean;
    userId!: string;
    params!: QueryParameters;
    playlists: Playlist[] = [];

    width!: number;
    left: number = 0;
    
    @ViewChild('nav') nav?: ElementRef;
    private navPosition!: { left: number, top: number };
    public mouse!: {x: number, y: number}
    mouseHold = false;
    
    constructor(private accountService: AccountService, private playlistService: PlaylistService, private router: Router,
        private errorService: ErrorHandlingService){
    }


    ngOnInit(): void {
        this.isArtist = this.accountService.isUserArtist();
        this.userId = this.accountService.getUserId();
        var filterArr: FilterCondition[] = [];
        filterArr.push(new FilterCondition("OwnerId", FilterConditionType.Equal, this.userId));
        var filter = new Filter(Operators.And, filterArr);
        this.params = new QueryParameters(filter, "Title desc", 1, 100);

        this.getPlaylists();
    }

    getPlaylists(){
        this.playlistService.getPlaylists(this.params).subscribe({
            next: (response) => {
                this.playlists = this.playlists.concat(response.data.items.filter(x => x.isCustom == true));
            },
            error: (response) => this.errorService.setError(response.error.exception.message)
        })
    }

    goToPlaylist(id: string){
        this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => this.router.navigate(['playlists', id]));
    }
}
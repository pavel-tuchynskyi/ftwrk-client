import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { HttpResponse } from "src/app/core/models/http-response";
import { PagedList } from "src/app/core/models/paged-list";
import { QueryParameters } from "src/app/core/models/query-parameters";
import { UriBuilderService } from "src/app/core/services/uribuilder.service";
import { Playlist } from "../models/playlists/playlist";
import { PlaylistCreate } from "../models/playlists/playlist-create";
import { PlaylistDetails } from "../models/playlists/playlist-details";
import { PlaylistEdit } from "../models/playlists/playlist-edit";

@Injectable({
    providedIn: 'root'
})
export class PlaylistService{
    private controller: string = "Playlists";

    constructor(private http: HttpClient, private uriBuilder: UriBuilderService){}

    getPlaylists(params: QueryParameters){
        return this.http.post<HttpResponse<PagedList<Playlist[]>>>(this.uriBuilder.createApiUri(this.controller, "GetPlaylists"), params);
    }

    createPlaylist(playlist: PlaylistCreate){
        let formData = new FormData();
        formData.set("Title", playlist.title);
        formData.set("Description", playlist.description);
        if(playlist.poster){
            formData.set("Poster", playlist.poster);
        }
        return this.http.post<HttpResponse<string>>(this.uriBuilder.createApiUri(this.controller, "AddPlaylist"), formData);
    }

    getCustomPlaylist(id: string){
        return this.http.get<HttpResponse<PlaylistDetails>>(this.uriBuilder.createApiUri(this.controller, `GetCustomPlaylist/${id}`));
    }

    getFavoritesPlaylist(){
        return this.http.get<HttpResponse<PlaylistDetails>>(this.uriBuilder.createApiUri(this.controller, 'GetFavoritePlaylist'));
    }

    editPlaylist(playlist: PlaylistEdit){
        let formData = new FormData();
        formData.set("Id", playlist.id);
        formData.set("OwnerId", playlist.ownerId);
        formData.set("Title", playlist.title);
        if(playlist.description){
            formData.set("Description", playlist.description);
        }
        if(playlist.poster){
            formData.set("Poster", playlist.poster);
        }
        return this.http.put<HttpResponse<boolean>>(this.uriBuilder.createApiUri(this.controller, 'UpdatePlaylist'), formData);
    }

    deletePlaylist(id: string){
        return this.http.delete<HttpResponse<PlaylistDetails>>(this.uriBuilder.createApiUri(this.controller, `DeletePlaylist/${id}`));
    }
}
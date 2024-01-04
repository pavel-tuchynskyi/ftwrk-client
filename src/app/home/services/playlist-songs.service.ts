import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { HttpResponse } from "src/app/core/models/http-response";
import { PagedList } from "src/app/core/models/paged-list";
import { UriBuilderService } from "src/app/core/services/uribuilder.service";
import { PlaylistSongUpdate } from "../models/playlists/playlist-song-update";
import { Song } from "../models/songs/song";

@Injectable()
export class PlaylistSongsService{
    private controller: string = "PlaylistSongs";

    constructor(private http: HttpClient, private uriBuilder: UriBuilderService){}

    getPlaylistSongs(playlistId: string, pageNumber: number, pageSize: number, orderBy?: string){
        return this.http.post<HttpResponse<PagedList<Song[]>>>(this.uriBuilder.createApiUri(this.controller, 'GetSongs'), 
        {
            playlistId: playlistId,
            orderBy: orderBy,
            pageNumber: pageNumber,
            pageSize: pageSize
        });
    }

    addSongToPlaylist(playlistId: string, songId: string, albumId: string){
        return this.http.post(this.uriBuilder.createApiUri(this.controller, 'AddSong'), 
        {
            playlistId: playlistId,
            songId: songId,
            albumId: albumId
        });
    }

    updatePlaylistSong(songUpdate: PlaylistSongUpdate){
        return this.http.put(this.uriBuilder.createApiUri(this.controller, 'UpdateSong'), songUpdate);
    }

    deletePlaylistSong(playlistId: string, songId: string){
        return this.http.post(this.uriBuilder.createApiUri(this.controller, 'DeleteSong'), 
        {
            playlistId: playlistId,
            songId: songId
        });
    }
}
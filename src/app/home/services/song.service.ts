import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { HttpResponse } from "src/app/core/models/http-response";
import { PagedList } from "src/app/core/models/paged-list";
import { UriBuilderService } from "src/app/core/services/uribuilder.service";
import { Song } from "../models/songs/song";
import { SongAdd } from "../models/songs/song-add";
import { SongDelete } from "../models/songs/song-delete";
import { SongEdit } from "../models/songs/song-edit";
import { Filter, FilterCondition } from "src/app/core/models/query-parameters";
import { Artist } from "../models/artist";
import { SongBlob } from "../models/songs/song-blob";

@Injectable({
    providedIn: 'root'
})
export class SongService{
    private controller: string = "AlbumSongs";
    public notificationUrl = this.uriBuilder.createApiUri('notify');

    constructor(private http: HttpClient, private uriBuilder: UriBuilderService){}

    getSongs(pageNumber: number, pageSize: number, albumId?: string, filter?: Filter, orderBy?: string){
        return this.http.post<HttpResponse<PagedList<Song[]>>>(this.uriBuilder.createApiUri(this.controller, 'GetSongs'), 
        {
            albumId: albumId,
            orderBy: orderBy,
            filter: filter,
            pageNumber: pageNumber,
            pageSize: pageSize
        });
    }

    addSong(song: SongAdd){
        let formData = new FormData();
        formData.set("AlbumId", song.albumId);
        formData.set("Title", song.title);
        formData.set("SongBlob", song.songBlob, song.songBlob.name);
        formData.set("ConnectionId", song.connectionId);
        for (let i = 0; i < song.artists.length; i++) {
            if (song.artists[i].id !== '' && song.artists[i].artistName !== '') {
              formData.append('Artists[' + i + '][id]', song.artists[i].id);
              formData.append('Artists[' + i + '][artistName]', song.artists[i].artistName);
            }
        }

        return this.http.post<HttpResponse<boolean>>(this.uriBuilder.createApiUri(this.controller, "AddSong"), formData);
    }

    getArtists(filter: FilterCondition, pageSize: number, pageNumber: number){
        return this.http.post<HttpResponse<PagedList<Artist[]>>>(this.uriBuilder.createApiUri(this.controller, "GetArtists"), {
            filterCondition: filter,
            pageSize: pageSize,
            pageNumber: pageNumber
        });
    }

    editSong(song: SongEdit){
        return this.http.post<HttpResponse<boolean>>(this.uriBuilder.createApiUri(this.controller, "UpdateSong"), song);
    }

    deleteSong(song: SongDelete){
        return this.http.post<HttpResponse<boolean>>(this.uriBuilder.createApiUri(this.controller, "DeleteSong"), song);
    }

    getSongUrl(albumId: string, songId: string){
        let query = new Map();
        query = query.set("albumId", albumId).set("songId", songId);
        return this.uriBuilder.createApiUri(this.controller, "GetSong", query);
    }
}
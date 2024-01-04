import { SongArtist } from "./song-artist";

export class SongEdit{
    constructor(public albumId: string, public songId: string, public title: string, public artists: SongArtist[]){}
}
import { SongArtist } from "./song-artist";

export class SongAdd{
    constructor(public albumId: string, public artists: SongArtist[], public title: string, public songBlob: File, public connectionId: string){}
}
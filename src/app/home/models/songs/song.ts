import { SongArtist } from "./song-artist";

export class Song{
    constructor(public id: string, public artists: SongArtist[], public title: string, public duration: number,
        public isArchived: boolean, public albumId: string, public albumTitle: string, public isFavorite: boolean){}
}
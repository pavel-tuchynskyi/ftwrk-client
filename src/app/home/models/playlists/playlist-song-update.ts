export class PlaylistSongUpdate{
    constructor(public playlistId: string, public songId: string, public albumId: string, public previous?: string, 
        public next?: string){}
}
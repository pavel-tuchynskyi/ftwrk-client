import { Image } from "src/app/dashboard/models/image/image";
import { Song } from "../songs/song";

export class PlaylistDetails{
    constructor(public id: string, public ownerId: string, public ownerName: string, public title: string, 
        public description: string, public poster: Image, public songs: Song[]){}
}
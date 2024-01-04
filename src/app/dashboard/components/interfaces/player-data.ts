import { PagedList } from "src/app/core/models/paged-list";
import { Song } from "src/app/home/models/songs/song";
import { AudioSource } from "../../models/player/audio-source";
import { PlayerParams } from "./player-params";

export interface PlayerData{
    source: AudioSource,
    params: PlayerParams,
    currentSong: Song,
    songList: PagedList<Song[]>
}
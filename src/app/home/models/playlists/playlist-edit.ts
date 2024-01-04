export class PlaylistEdit{
    constructor(public id: string, public ownerId: string, public title: string, public description?: string,
        public poster?: File){}
}
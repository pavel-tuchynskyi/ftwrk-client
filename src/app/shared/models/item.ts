import { SafeUrl } from "@angular/platform-browser";

export class Item{
    constructor(public id: string, public poster: SafeUrl | string, public title: string){}
}
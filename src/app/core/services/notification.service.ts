import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private notification$: Subject<string> = new Subject<string>();
    constructor(){}

    setNotification(message: string){
        this.notification$.next(message);
    }

    getNotification(){
        return this.notification$.asObservable();
    }
}
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class FetchService{
    subject = new BehaviorSubject<boolean>(false);

    setValue(value: boolean){
        this.subject.next(value);
    }

    getSubj(){
        return this.subject.asObservable();
    }
}
import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ErrorHandlingService{
    private errorSubject: Subject<string> = new Subject<string>();

    setError(error: string){
        this.errorSubject.next(error);
    }

    getError(): Observable<string>{
        let error = this.errorSubject.asObservable();
        return error;
    }
}
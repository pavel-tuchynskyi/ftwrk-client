import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class LoaderService{
    private loading$: Subject<boolean> = new Subject<boolean>();

    constructor() { }

    setLoading(loading: boolean) {
        this.loading$.next(loading);
    }

    getLoading() {
        return this.loading$.asObservable();
    }
}
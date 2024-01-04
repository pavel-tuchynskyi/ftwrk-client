import { Component, OnInit } from "@angular/core";
import { ErrorHandlingService } from "../../services/error-handling.service";

@Component({
    selector: 'app-error-handler',
    templateUrl: './error-handler.component.html',
    styleUrls: ['./error-handler.component.scss']
})
export class ErrorHandlerComponent implements OnInit{
    errorArray: string[] = [];

    constructor(private errorService: ErrorHandlingService){}

    ngOnInit(): void {
        this.errorService.getError().subscribe(data => {
            this.errorArray.push(data);
            setTimeout(() => {
                this.errorArray.forEach(function(item, index, array){
                    array.shift();
                });
            }, 5000);
        });
    }
}
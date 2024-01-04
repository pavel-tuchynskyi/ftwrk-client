import { Component, OnInit } from "@angular/core";
import { NotificationService } from "../../services/notification.service";

@Component({
    selector: 'app-notify',
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit{
    notifications: string[] = [];
    constructor(private notify: NotificationService){}

    ngOnInit(): void {
        this.notify.getNotification().subscribe(data => {
            this.notifications.push(data);
            setTimeout(() => {
                this.notifications.forEach(function(item, index, array){
                    array.shift();
                });
            }, 5000);
        });
    }
}
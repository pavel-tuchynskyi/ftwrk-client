import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Item } from "../../models/item";

@Component({
    selector: 'app-item-group',
    templateUrl: './item-group.component.html',
    styleUrls: ['./item-group.component.scss'],
    providers: []
})
export class ItemGroupComponent{
    pageNumber: number = 1;

    @Input('items') items: Item[] = [];

    @Output('pageNumber') nextPage = new EventEmitter<number>();
    @Output('itemClicked') itemClicked = new EventEmitter<Item>();

    constructor(){}

    onScroll(): void {
        this.pageNumber += 1;
        this.nextPage.emit(this.pageNumber);
    }

    clicked(item: Item){
        this.itemClicked.emit(item);
    }
}
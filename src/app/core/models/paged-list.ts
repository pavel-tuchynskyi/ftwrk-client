export class PagedList<T>{
    constructor(public currentPage: number, public pageSize: number, public totalPages: number, 
        public totalRecords: number, public items: T){}
}
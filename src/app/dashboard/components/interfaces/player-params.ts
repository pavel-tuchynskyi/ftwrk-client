import { Filter } from "src/app/core/models/query-parameters";

export interface PlayerParams{
    id?: string,
    fiter?: Filter,
    pageSize: number,
    pageNumber: number,
    orderBy?: string,
}
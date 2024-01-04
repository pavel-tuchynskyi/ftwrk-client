export class TableData{
    constructor(public header: string[], public rows: Row[]){}
}

export class Row{
    constructor(public cell: any[]){}
}
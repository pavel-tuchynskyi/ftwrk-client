export class QueryParameters{
    constructor(public filter: Filter, public orderBy: string, public pageNumber: number, public pageSize: number){}
}

export class FilterCondition{
    constructor(public key: string, public conditionType: FilterConditionType, public value: any){}
}

export enum FilterConditionType
{
    Equal,
    Contains,
    InArray
}

export enum Operators{
    And,
    Or
}

export class Filter{
    constructor(public operator: Operators, public conditions: FilterCondition[]){}
}
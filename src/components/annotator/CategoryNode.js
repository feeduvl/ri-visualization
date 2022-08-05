import { Node } from "@baklavajs/core";

export class CategoryNode extends Node {
    constructor(name, absValue, relValue) {
        super();
        this.type = "CategoryNode";
        this.name = name;
        this.absValue = absValue;
        this.relValue = relValue;
        this.absRank = 80;
        this.relRank = 80;
        this.xValue = 0;
        this.yValue = 0;
    }
}
import { Node } from "@baklavajs/core";

export class RelationNode extends Node {
    constructor(name, input, output, absValue, relValue) {
        super();
        this.type = "RelationNode";
        this.name = name;
        this.start = input;
        this.end = output;
        this.absValue = absValue;
        this.relValue = relValue;
        this.absRank = 80;
        this.relRank = 80;
    }
}
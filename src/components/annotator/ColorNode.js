import { Node } from "@baklavajs/core";

export class ColorNode extends Node {
    constructor(name, absValue, relValue) {
        super();
        this.type = "ColorNode";
        this.name = name;
        this.absValue = absValue;
        this.relValue = relValue;
        this.absRank = 80;
        this.relRank = 80;
    }
}
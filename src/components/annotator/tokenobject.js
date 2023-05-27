export class Token {
    constructor(name, absValue, relValue) {
        this.name = name;
        this.absValue = absValue;
        this.relValue = relValue;
        this.xValue = 0;
        this.yValue = 0;
    }
}
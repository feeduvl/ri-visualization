<template>
    <div id="tree-simple"> </div>
</template>

<script>
    export default {
        name: "DecisionTree",
        props: {
            tree: Array
        },
        mounted() {
            this.$loadScript("dashboard/raphael.js").then(
                ()=>{
                    this.$loadScript("dashboard/Treant.js").then(this.addTree)
                });
        },
        created(){

        },
        methods: {
            addTree() {
                const leaf_input = "dec-tree__leaf_node_input";
                const leaf_corpus = "dec-tree__leaf_node_corpus";

                let config = {
                    container: "#tree-simple",
                    nodeAlign: "BOTTOM",

                    connectors: {
                        type: 'step'
                    },
                    node: {
                        HTMLclass: 'nodeExample1'
                    }
                };
                const nodes = [config];
                let node_map = {};

                for (let i = 0; i < this.tree.length / 2; i++) {
                    let label = this.tree[2 * i + 1];
                    let node_nr = parseInt(this.tree[2 * i]);
                    let obj = {};  //  root node
                    if (label === "0") {
                        obj.HTMLclass = leaf_corpus;
                        label = "Corpus"
                    } else if (label === "1") {
                        obj.HTMLclass = leaf_input;
                        label = "Input"
                    }
                    obj.text = {name: label}
                    if (node_nr !== 1) {
                        obj.parent = node_map[Math.floor(node_nr / 2)];
                    }
                    node_map[node_nr] = obj;
                    nodes.push(obj);
                }
                //console.log(nodes);
                new window.Treant(nodes);
            }
        }
    }
</script>
<style>
    .chart { height: 550px; margin: 5px; width: 900px;  }
    .Treant > .node {  }
    .Treant > p { font-family: "HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif; font-weight: bold; font-size: 12px; }
    .node-name { font-weight: bold;}

    #tree-simple {
        position: absolute;
    }

    #tree-simple svg {
        position: absolute;
    }

    .nodeExample1 {
        position: absolute;
        padding: 2px;
        -webkit-border-radius: 3px;
        -moz-border-radius: 3px;
        border-radius: 3px;
        background-color: #ffffff;
        border: 1px solid #000;
        min-width: 50px;
        font-family: Tahoma;
        font-size: 12px;
    }

    .dec-tree__leaf_node_input {
        border: 3px solid red;
    }

    .dec-tree__leaf_node_corpus {
        border: 3px solid blue;
    }

</style>
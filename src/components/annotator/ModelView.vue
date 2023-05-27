<template>
    <v-app>
        <v-container fluid fill-height>
            <v-layout style="width: 100vw; height: 70vh">
                <v-flex style="width: 80%; min-width: 650px; height:100%; min-height: 550px;">
                    <baklava-editor :plugin="viewPlugin" />
                </v-flex>
                <v-flex>
                    <v-card style="height:80vh; min-height: 200px;">
                        <v-card-title>
                            Options
                        </v-card-title>
                        <v-card-actions>
                            <v-btn @click="saveGraph()">Save Graph</v-btn>
                        </v-card-actions>
                        <v-card-actions>
                            <v-btn @click="resetGraph()">Reset Graph</v-btn>
                        </v-card-actions>
                        <v-card-actions>
                            <v-switch v-model="heatmap" label="Toggle Heatmap" :input-value="true"
                                      @change="repaintGraph()"></v-switch>
                        </v-card-actions>
                        <v-card-actions>
                            <v-switch v-model="relationsOn" label="Toggle Relations" :input-value="true"
                                      @change="resetGraph()"></v-switch>
                        </v-card-actions>
                        <v-card-actions>
                            <v-switch v-model="displayMode" :input-value="true" false-value="Appearances"
                                      true-value="Occurences" @change="repaintGraph()">
                                <template v-slot:label>
                                    Display Mode: <br>
                                    {{ displayMode == "Appearances" ? 'Appearances' : 'Occurences' }}
                                </template>
                            </v-switch>
                        </v-card-actions>
                        <v-text-field placeholder="Category Node Color" hide-details class="ma-0 pa-0" readonly solo>
                            <template v-slot:append>
                                <v-menu v-model="categoryMenu" top nudge-bottom="105" nudge-left="16"
                                        :close-on-content-click="false">
                                    <template v-slot:activator="{ on }">
                                        <div :style="swatchStyleCategory" v-on="on" />
                                    </template>
                                    <v-card>
                                        <v-card-text class="pa-0">
                                            <color-panel v-model="categoryColor">
                                            </color-panel>
                                        </v-card-text>
                                    </v-card>
                                </v-menu>
                            </template>
                        </v-text-field>
                        <v-text-field placeholder="Relationship Node Color" hide-details class="ma-0 pa-0" readonly solo>
                            <template v-slot:append>
                                <v-menu v-model="relationMenu" top nudge-bottom="105" nudge-left="16"
                                        :close-on-content-click="false">
                                    <template v-slot:activator="{ on }">
                                        <div :style="swatchStyleRelation" v-on="on" />
                                    </template>
                                    <v-card>
                                        <v-card-text class="pa-0">
                                            <color-panel v-model="relationColor">
                                            </color-panel>
                                        </v-card-text>
                                    </v-card>
                                </v-menu>
                            </template>
                        </v-text-field>
                    </v-card>
                </v-flex>
            </v-layout>
        </v-container>
        <v-container style="height:20vh; min-height: 150px;" fluid>
            <v-layout justify-center>
                <v-card style=" min-height: 100px; width: 50vw; min-width: 400px">
                    <v-card-title>
                        Category Nodes
                    </v-card-title>
                    <v-layout>
                        <v-flex style="width: 100%; height:100%;">
                            <v-card>
                                <div class="legendCategory0">
                                    {{ maximumCategory * 0 }} - {{ Math.floor(maximumCategory * 0.2) }}
                                </div>
                            </v-card>
                        </v-flex>
                        <v-flex style="width: 100%; height:100%;">
                            <v-card>
                                <div class="legendCategory20">
                                    {{ Math.floor(maximumCategory * 0.2) + 1 }} - {{ Math.floor(maximumCategory * 0.4) }}
                                </div>
                            </v-card>
                        </v-flex>
                        <v-flex style="width: 100%; height:100%;">
                            <v-card>
                                <div class="legendCategory40">
                                    {{ Math.floor(maximumCategory * 0.4) + 1 }} - {{ Math.floor(maximumCategory * 0.6) }}
                                </div>
                            </v-card>
                        </v-flex>
                        <v-flex style="width: 100%; height:100%;">
                            <v-card>
                                <div class="legendCategory60">
                                    {{ Math.floor(maximumCategory * 0.6) + 1 }} - {{ Math.floor(maximumCategory * 0.8) }}
                                </div>
                            </v-card>
                        </v-flex>
                        <v-flex style="width: 100%; height:100%;">
                            <v-card>
                                <div class="legendCategory80">
                                    {{ Math.floor(maximumCategory * 0.8) + 1 }} - {{ Math.floor(maximumCategory) }}
                                </div>
                            </v-card>
                        </v-flex>
                    </v-layout>
                </v-card>
                <v-card style=" min-height: 100px; width: 50vw; min-width: 400px">
                    <v-card-title>
                        Relationship Nodes
                    </v-card-title>
                    <v-layout>
                        <v-flex style="width: 100%; height:100%;">
                            <v-card>
                                <div class="legendRelation0">
                                    {{ maximumRelation * 0 }} - {{ Math.floor(maximumRelation * 0.2) }}
                                </div>
                            </v-card>
                        </v-flex>
                        <v-flex style="width: 100%; height:100%;">
                            <v-card>
                                <div class="legendRelation20">
                                    {{ Math.floor(maximumRelation * 0.2) + 1 }} - {{ Math.floor(maximumRelation * 0.4) }}
                                </div>
                            </v-card>
                        </v-flex>
                        <v-flex style="width: 100%; height:100%;">
                            <v-card>
                                <div class="legendRelation40">
                                    {{ Math.floor(maximumRelation * 0.4) + 1 }} - {{ Math.floor(maximumRelation * 0.6) }}
                                </div>
                            </v-card>
                        </v-flex>
                        <v-flex style="width: 100%; height:100%;">
                            <v-card>
                                <div class="legendRelation60">
                                    {{ Math.floor(maximumRelation * 0.6) + 1 }} - {{ Math.floor(maximumRelation * 0.8) }}
                                </div>
                            </v-card>
                        </v-flex>
                        <v-flex style="width: 100%; height:100%;">
                            <v-card>
                                <div class="legendRelation80">
                                    {{ Math.floor(maximumRelation * 0.8) + 1 }} - {{ Math.floor(maximumRelation) }}
                                </div>
                            </v-card>
                        </v-flex>
                    </v-layout>
                </v-card>
            </v-layout>
        </v-container>
    </v-app>
</template>

<script>
import { Editor } from "@baklavajs/core";
import { ViewPlugin } from "@baklavajs/plugin-renderer-vue";
import { InterfaceTypePlugin } from '@baklavajs/plugin-interface-types'
import { CategoryNode } from "./CategoryNode";
import { RelationNode } from "./RelationNode"
import { Token } from "./tokenobject";
import { Relation } from "./relation";
import { tore_codes, tore_relationships, tore_locations } from "./TORE_visualization_codes";
import { ColorPanel } from 'one-colorpicker'
import "@baklavajs/plugin-renderer-vue/dist/styles.css";

export default {
    props: {
        tore_code_frequency: {
            required: true
        },
        tore_relationship_frequency: {
            required: true
        }
    },
    watch: {
        tore_code_frequency(new_frequencies, old_frequencies) {
            this.resetGraph()
        },
        tore_relationship_frequency(new_frequencies, old_frequencies) {
            this.resetGraph()
        }
    },
    components: {
        ColorPanel
    },
    data() {
        return {
            editor: new Editor(),
            viewPlugin: new ViewPlugin(),
            intfTypePlugin: new InterfaceTypePlugin(),
            tokenList: [],
            relationList: [],
            categoryColor: 'rgb(51, 128, 43)',
            relationColor: 'rgb(43, 47, 121)',
            heatmap: true,
            displayMode: "Occurences",
            maximumCategory: 0,
            absMaxCategory: 0,
            relMaxCategory: 0,
            maximumRelation: 0,
            absMaxRelation: 0,
            relMaxRelation: 0,
            categoryMenu: false,
            relationMenu: false,
            relationsOn: true
        };
    },
    computed: {
        swatchStyleCategory() {
            const { categoryColor, categoryMenu } = this
            return {
                backgroundColor: categoryColor,
                cursor: 'pointer',
                height: '30px',
                width: '30px',
                borderRadius: categoryMenu ? '50%' : '4px',
                transition: 'border-radius 200ms ease-in-out'
            }
        },
        swatchStyleRelation() {
            const { relationColor, relationMenu } = this
            return {
                backgroundColor: relationColor,
                cursor: 'pointer',
                height: '30px',
                width: '30px',
                borderRadius: relationMenu ? '50%' : '4px',
                transition: 'border-radius 200ms ease-in-out'
            }
        }
    },
    created() {
        this.editor.use(this.viewPlugin);

        this.editor.registerNodeType("CategoryNode", CategoryNode);
        this.editor.registerNodeType("RelationNode", RelationNode);

        this.intfTypePlugin.addType("input", "rgba(255, 255, 255, 1)");
        this.intfTypePlugin.addType("output", "rgba(255, 255, 255, 0)");
        this.intfTypePlugin.addConversion("input", "output");

        this.editor.use(this.intfTypePlugin);

        this.initializeGraph();
    },
    methods: {
        createTokens() {
            var tokenList = {};
            for (const [code, frequencies] of Object.entries(this.tore_code_frequency)) {
                tore_codes.forEach(acceptableCode => {
                    if (code == acceptableCode) {
                        var element = new Token(code, frequencies[0], frequencies[1]);
                        element.xValue = tore_locations[code][0];
                        element.yValue = tore_locations[code][1];
                        tokenList[code] = element;
                    }
                });
            }
            return tokenList;
        },
        createRelations() {
            var relationList = {};
            for (const [code, frequencies] of Object.entries(this.tore_relationship_frequency)) {
                var start = this.tokenList[tore_relationships[code][0]];
                var end = this.tokenList[tore_relationships[code][1]];
                if (start != undefined && end != undefined) {
                    var relation = new Relation(code, frequencies[0], frequencies[1], start, end);
                    relation.xValue = tore_locations[code][0];
                    relation.yValue = tore_locations[code][1];
                    relationList[code] = relation;
                }
            }
            return relationList;
        },
        initializeGraph() {
            this.tokenList = this.createTokens();
            this.relationList = this.createRelations();
            var nodeList = this.createNodeListFromData();
            this.partitionNodes(nodeList);
            this.paintNodes(nodeList);
            this.placeNodesInEditor(nodeList, 100, 100, 300, 900);
            this.connectNodes();
        },
        createNodeListFromData() {
            var nodeList = [];
            for (const [name, token] of Object.entries(this.tokenList)) {
                var node = this.createNode(CategoryNode, name, token.absValue, token.relValue);
                node.xValue = token.xValue;
                node.yValue = token.yValue;
                nodeList.push(node);
            }
            for (const [name, relation] of Object.entries(this.relationList)) {
                var start = 0;
                var end = 0;
                nodeList.forEach(node => {
                        if (node.name == relation.start.name) {
                            start = node;
                        }
                        if (node.name == relation.end.name) {
                            end = node;
                        }
                    }
                )
                if (start != 0 && end != 0) {
                    node = new RelationNode(name, start, end, relation.absValue, relation.relValue)
                    node.xValue = relation.xValue;
                    node.yValue = relation.yValue;
                    nodeList.push(node);
                }
            }
            return nodeList
        },
        createNode(nodeType, name, absValue, relValue) {
            return new nodeType(name, absValue, relValue);
        },
        placeNodesInEditor(nodeList) {
            nodeList.forEach(node => {
                if (node.type == "RelationNode" && this.relationsOn) {
                    this.editor.addNode(node);
                    node.position.x = node.xValue;
                    node.position.y = node.yValue;
                } else if (node.type == "CategoryNode") {
                    this.editor.addNode(node);
                    node.position.x = node.xValue;
                    node.position.y = node.yValue;
                }

            });
        },
        connectNodes() {
            var nodeList = this.getNodeList();
            nodeList.forEach(node => {
                if (node.type == "RelationNode") {
                    this.addConnection(node);
                }
            });
        },
        addConnection(node) {
            var validInput = 0;
            var validOutput = 0;
            var inputName = 0;
            var outputName = 0;
            var end = node.end;
            var start = node.start;
            var endName = end.name.concat("output");
            var startName = start.name.concat("input");

            node.addInputInterface(startName, { type: "input" });
            node.addOutputInterface(endName, { type: "output" });

            end.interfaces.forEach(inter => {
                if (inter.isInput) {
                    validInput = inter;
                }
            });
            start.interfaces.forEach(inter => {
                if (!inter.isInput) {
                    validOutput = inter;
                }
            })
            if (validInput != 0 && validOutput != 0) {
                this.editor.addConnection(
                    validInput,
                    node.getInterface(endName)
                )
                this.editor.addConnection(
                    node.getInterface(startName),
                    validOutput
                )
            } else if (validInput == 0 && validOutput != 0) {
                inputName = (end.interfaces.size).toString();
                end.addInputInterface(inputName, { type: "input" });
                this.editor.addConnection(
                    end.getInterface(inputName),
                    node.getInterface(endName)
                )
                this.editor.addConnection(
                    node.getInterface(startName),
                    validOutput
                )
            } else if (validInput != 0 && validOutput == 0) {
                outputName = (start.interfaces.size).toString();
                start.addOutputInterface(outputName, { type: "output" });
                this.editor.addConnection(
                    validInput,
                    node.getInterface(endName)
                )
                this.editor.addConnection(
                    start.getInterface(outputName),
                    node.getInterface(startName)
                )
            } else {
                inputName = (end.interfaces.size).toString();
                outputName = (start.interfaces.size).toString();
                end.addInputInterface(inputName, { type: "input" });
                start.addOutputInterface(outputName, { type: "output" });
                this.editor.addConnection(
                    end.getInterface(inputName),
                    node.getInterface(endName)
                );
                this.editor.addConnection(
                    start.getInterface(outputName),
                    node.getInterface(startName)
                );
            }
        },
        partitionNodes(nodeList) {
            var maximums = this.getMaximums(nodeList, "CategoryNode");
            this.absMaxCategory = maximums[0];
            this.relMaxCategory = maximums[1];

            maximums = this.getMaximums(nodeList, "RelationNode");
            this.absMaxRelation = maximums[0];
            this.relMaxRelation = maximums[1];

            this.setNodeRanks(nodeList, "CategoryNode");
            this.setNodeRanks(nodeList, "RelationNode");
        },
        getMaximums(nodeList, NodeType) {
            var maximums = [];
            var maxAbs = 0;
            var maxRel = 0;
            nodeList.forEach(node => {
                if (node.type == NodeType) {
                    var absVal = node.absValue;
                    var relVal = node.relValue;
                    if (absVal >= maxAbs) {
                        maxAbs = absVal;
                    }
                    if (relVal >= maxRel) {
                        maxRel = relVal;
                    }
                }
            });
            maximums.push(maxAbs);
            maximums.push(maxRel);
            return maximums;
        },
        setNodeRanks(nodeList, NodeType) {
            var absMax = 0;
            var relMax = 0;
            var step = 0.2;
            if (NodeType == "RelationNode") {
                absMax = this.absMaxRelation
                relMax = this.relMaxRelation
            } else if (NodeType == "CategoryNode") {
                absMax = this.absMaxCategory
                relMax = this.relMaxCategory
            }
            nodeList.forEach(node => {
                if (node.type == NodeType) {
                    var absVal = node.absValue;
                    var relVal = node.relValue;
                    for (let i = 0; i < 5; i++) {
                        var upperLimitAbs = absMax * ((i + 1) * step);
                        var lowerLimitAbs = absMax * i * step;
                        if (upperLimitAbs >= absVal && absVal > lowerLimitAbs) {
                            node.absRank = Math.floor(i * step * 100);
                        }
                        var upperLimitRel = relMax * ((i + 1) * step);
                        var lowerLimitRel = relMax * i * step;
                        if (upperLimitRel >= relVal && relVal > lowerLimitRel) {
                            node.relRank = Math.floor(i * step * 100);
                        }
                    }
                }
            });
        },
        paintNodes(nodeList) {
            if (this.heatmap) {
                if (this.displayMode == "Occurences") {
                    this.maximumCategory = this.absMaxCategory;
                    this.maximumRelation = this.absMaxRelation;
                    nodeList.forEach(node => {
                        switch (node.absRank) {
                            case 80:
                                if (node.type == "RelationNode") {
                                    node.customClasses = "val80Rel"
                                } else {
                                    node.customClasses = "val80";
                                }
                                break;
                            case 60:
                                if (node.type == "RelationNode") {
                                    node.customClasses = "val60Rel"
                                } else {
                                    node.customClasses = "val60";
                                }
                                break;
                            case 40:
                                if (node.type == "RelationNode") {
                                    node.customClasses = "val40Rel"
                                } else {
                                    node.customClasses = "val40";
                                }
                                break;
                            case 20:
                                if (node.type == "RelationNode") {
                                    node.customClasses = "val20Rel"
                                } else {
                                    node.customClasses = "val20";
                                }
                                break;
                            case 0:
                                if (node.type == "RelationNode") {
                                    node.customClasses = "val0Rel"
                                } else {
                                    node.customClasses = "val0";
                                }
                                break;
                        }
                    });
                } else if (this.displayMode == "Appearances") {
                    this.maximumCategory = this.relMaxCategory;
                    this.maximumRelation = this.relMaxRelation;
                    nodeList.forEach(node => {
                        switch (node.relRank) {
                            case 80:
                                if (node.type == "RelationNode") {
                                    node.customClasses = "val80Rel"
                                } else {
                                    node.customClasses = "val80";
                                }
                                break;
                            case 60:
                                if (node.type == "RelationNode") {
                                    node.customClasses = "val60Rel"
                                } else {
                                    node.customClasses = "val60";
                                }
                                break;
                            case 40:
                                if (node.type == "RelationNode") {
                                    node.customClasses = "val40Rel"
                                } else {
                                    node.customClasses = "val40";
                                }
                                break;
                            case 20:
                                if (node.type == "RelationNode") {
                                    node.customClasses = "val20Rel"
                                } else {
                                    node.customClasses = "val20";
                                }
                                break;
                            case 0:
                                if (node.type == "RelationNode") {
                                    node.customClasses = "val0Rel"
                                } else {
                                    node.customClasses = "val0";
                                }
                                break;
                        }
                    });
                }
            } else {
                nodeList.forEach(node => {
                    if (node.type == "RelationNode") {
                        node.customClasses = "defaultRel"
                    } else {
                        node.customClasses = "default";
                    }
                });
            }
        },
        resetGraph() {
            this.removeAllNodes();
            this.initializeGraph();
        },
        repaintGraph() {
            var nodeList = this.getNodeList();
            var positions = this.saveNodePositions(nodeList);
            this.removeAllNodes();
            this.paintNodes(nodeList);
            this.placeAllNodes(nodeList, positions);
            this.connectNodes();
        },
        saveNodePositions(nodeList) {
            var positions = {};
            nodeList.forEach(node => {
                positions[node.name] = [node.position.x, node.position.y];
            });
            return positions;
        },
        placeAllNodes(nodeList, positions) {
            nodeList.forEach(node => {
                this.editor.addNode(node);
                node.position.x = positions[node.name][0];
                node.position.y = positions[node.name][1];
            });
        },
        removeAllNodes() {
            var nodeList = this.getNodeList();
            nodeList.forEach(node => {
                this.editor.removeNode(node);
            });
        },
        getNodeList() {
            var nodeList = [];
            this.editor.nodes.forEach(node => {
                nodeList.push(node);
            });
            return nodeList;
        },
        saveGraph() {
            const data = JSON.stringify(this.editor.save())
            const blob = new Blob([data], { type: 'text/plain' })
            const e = document.createEvent('MouseEvents'),
                a = document.createElement('a');
            a.download = "graph.json";
            a.href = window.URL.createObjectURL(blob);
            a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
            e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            a.dispatchEvent(e);
        }
    }
};
</script>

<style >
.node {
    background: rgba(255, 255, 255, 1);
    color: rgba(0, 0, 0, 0);

}

.node .__title {
    background: rgba(255, 255, 255, 0);
    color: rgb(255, 255, 255);
}

.node-editor .background {
    background-color: #ffffffd8;
    background: none;
}

.connection {
    stroke: rgb(138, 130, 130);
    stroke-width: 4px;
}

.--input {
    max-height: 0px;
}

.--output {
    max-height: 0px;
}

.node-interface .__port {
    border-radius: 50%;
    background: black;
    height: 15px;
    width: 15px;
}

.__port-output {
    opacity: 0;
}

.val0 {
    text-align: center;
    background: v-bind(categoryColor);
    filter: brightness(200%);
}

.val0 .__title {
    overflow-wrap: break-word;
    max-height: fit-content;
    font-size: 2rem;
    text-shadow:
        0.05em 0 black,
        0 0.05em black,
        -0.05em 0 black,
        0 -0.05em black,
        -0.05em -0.05em black,
        -0.05em 0.05em black,
        0.05em -0.05em black,
        0.05em 0.05em black;
}

.val20 {
    text-align: center;
    background: v-bind(categoryColor);
    filter: brightness(160%);
}

.val20 .__title {
    overflow-wrap: break-word;
    max-height: fit-content;
    font-size: 2rem;
    text-shadow:
        0.05em 0 black,
        0 0.05em black,
        -0.05em 0 black,
        0 -0.05em black,
        -0.05em -0.05em black,
        -0.05em 0.05em black,
        0.05em -0.05em black,
        0.05em 0.05em black;
}

.val40 {
    text-align: center;
    background: v-bind(categoryColor);
    filter: brightness(120%);
}

.val40 .__title {
    overflow-wrap: break-word;
    max-height: fit-content;
    font-size: 2rem;
    text-shadow:
        0.05em 0 black,
        0 0.05em black,
        -0.05em 0 black,
        0 -0.05em black,
        -0.05em -0.05em black,
        -0.05em 0.05em black,
        0.05em -0.05em black,
        0.05em 0.05em black;
}

.val60 {
    text-align: center;
    background: v-bind(categoryColor);
    filter: brightness(80%);
}

.val60 .__title {
    overflow-wrap: break-word;
    max-height: fit-content;
    font-size: 2rem;
    text-shadow:
        0.05em 0 black,
        0 0.05em black,
        -0.05em 0 black,
        0 -0.05em black,
        -0.05em -0.05em black,
        -0.05em 0.05em black,
        0.05em -0.05em black,
        0.05em 0.05em black;
}

.val80 {
    text-align: center;
    background: v-bind(categoryColor);
    filter: brightness(40%);
}

.val80 .__title {
    overflow-wrap: break-word;
    max-height: fit-content;
    font-size: 2rem;
    text-shadow:
        0.05em 0 black,
        0 0.05em black,
        -0.05em 0 black,
        0 -0.05em black,
        -0.05em -0.05em black,
        -0.05em 0.05em black,
        0.05em -0.05em black,
        0.05em 0.05em black;
}

.val0Rel {
    text-align: center;
    background: v-bind(relationColor);
    filter: brightness(200%);
    max-width: 8rem;
}

.val0Rel .__title {
    overflow-wrap: break-word;
    max-height: fit-content;
    font-size: 1.2rem;
    text-shadow:
        0.05em 0 black,
        0 0.05em black,
        -0.05em 0 black,
        0 -0.05em black,
        -0.05em -0.05em black,
        -0.05em 0.05em black,
        0.05em -0.05em black,
        0.05em 0.05em black;
}

.val20Rel {
    text-align: center;
    background: v-bind(relationColor);
    filter: brightness(160%);
    max-width: 8rem;
}

.val20Rel .__title {
    overflow-wrap: break-word;
    max-height: fit-content;
    font-size: 1.2rem;
    text-shadow:
        0.05em 0 black,
        0 0.05em black,
        -0.05em 0 black,
        0 -0.05em black,
        -0.05em -0.05em black,
        -0.05em 0.05em black,
        0.05em -0.05em black,
        0.05em 0.05em black;
}

.val40Rel {
    text-align: center;
    background: v-bind(relationColor);
    filter: brightness(120%);
    max-width: 8rem;
}

.val40Rel .__title {
    overflow-wrap: break-word;
    max-height: fit-content;
    font-size: 1.2rem;
    text-shadow:
        0.05em 0 black,
        0 0.05em black,
        -0.05em 0 black,
        0 -0.05em black,
        -0.05em -0.05em black,
        -0.05em 0.05em black,
        0.05em -0.05em black,
        0.05em 0.05em black;
}

.val60Rel {
    text-align: center;
    background: v-bind(relationColor);
    filter: brightness(80%);
    max-width: 8rem;
}

.val60Rel .__title {
    overflow-wrap: break-word;
    max-height: fit-content;
    font-size: 1.2rem;
    text-shadow:
        0.05em 0 black,
        0 0.05em black,
        -0.05em 0 black,
        0 -0.05em black,
        -0.05em -0.05em black,
        -0.05em 0.05em black,
        0.05em -0.05em black,
        0.05em 0.05em black;
}

.val80Rel {
    text-align: center;
    background: v-bind(relationColor);
    filter: brightness(40%);
    max-width: 8rem;
}

.val80Rel .__title {
    overflow-wrap: break-word;
    max-height: fit-content;
    font-size: 1.2rem;
    text-shadow:
        0.05em 0 black,
        0 0.05em black,
        -0.05em 0 black,
        0 -0.05em black,
        -0.05em -0.05em black,
        -0.05em 0.05em black,
        0.05em -0.05em black,
        0.05em 0.05em black;
}

.default {
    text-align: center;
}

.default .__title {
    overflow-wrap: break-word;
    max-height: fit-content;
    font-size: 2rem;
    text-shadow:
        0.05em 0 black,
        0 0.05em black,
        -0.05em 0 black,
        0 -0.05em black,
        -0.05em -0.05em black,
        -0.05em 0.05em black,
        0.05em -0.05em black,
        0.05em 0.05em black;
}

.defaultRel {
    text-align: center;
    max-width: 8rem;
}

.defaultRel .__title {
    overflow-wrap: break-word;
    max-height: fit-content;
    font-size: 1.2rem;
    text-shadow:
        0.05em 0 black,
        0 0.05em black,
        -0.05em 0 black,
        0 -0.05em black,
        -0.05em -0.05em black,
        -0.05em 0.05em black,
        0.05em -0.05em black,
        0.05em 0.05em black;
}

.legendCategory0 {
    background: v-bind(categoryColor);
    filter: brightness(200%);
    height: 100%;
    text-align: center;
    font-size: 200%;
    color: rgb(240, 227, 227);
    text-shadow:
        0.05em 0 black,
        0 0.05em black,
        -0.05em 0 black,
        0 -0.05em black,
        -0.05em -0.05em black,
        -0.05em 0.05em black,
        0.05em -0.05em black,
        0.05em 0.05em black;
}

.legendCategory20 {
    background: v-bind(categoryColor);
    filter: brightness(160%);
    height: 100%;
    text-align: center;
    font-size: 200%;
    color: rgb(240, 227, 227);
    text-shadow:
        0.05em 0 black,
        0 0.05em black,
        -0.05em 0 black,
        0 -0.05em black,
        -0.05em -0.05em black,
        -0.05em 0.05em black,
        0.05em -0.05em black,
        0.05em 0.05em black;
}

.legendCategory40 {
    background: v-bind(categoryColor);
    filter: brightness(120%);
    height: 100%;
    text-align: center;
    font-size: 200%;
    color: rgb(240, 227, 227);
    text-shadow:
        0.05em 0 black,
        0 0.05em black,
        -0.05em 0 black,
        0 -0.05em black,
        -0.05em -0.05em black,
        -0.05em 0.05em black,
        0.05em -0.05em black,
        0.05em 0.05em black;
}

.legendCategory60 {
    background: v-bind(categoryColor);
    filter: brightness(80%);
    height: 100%;
    text-align: center;
    font-size: 200%;
    color: rgb(240, 227, 227);
    text-shadow:
        0.05em 0 black,
        0 0.05em black,
        -0.05em 0 black,
        0 -0.05em black,
        -0.05em -0.05em black,
        -0.05em 0.05em black,
        0.05em -0.05em black,
        0.05em 0.05em black;
}

.legendCategory80 {
    background: v-bind(categoryColor);
    filter: brightness(40%);
    height: 100%;
    text-align: center;
    font-size: 200%;
    color: rgb(240, 227, 227);
    text-shadow:
        0.05em 0 black,
        0 0.05em black,
        -0.05em 0 black,
        0 -0.05em black,
        -0.05em -0.05em black,
        -0.05em 0.05em black,
        0.05em -0.05em black,
        0.05em 0.05em black;
}

.legendRelation0 {
    background: v-bind(relationColor);
    filter: brightness(200%);
    height: 100%;
    text-align: center;
    font-size: 200%;
    color: rgb(240, 227, 227);
    text-shadow:
        0.05em 0 black,
        0 0.05em black,
        -0.05em 0 black,
        0 -0.05em black,
        -0.05em -0.05em black,
        -0.05em 0.05em black,
        0.05em -0.05em black,
        0.05em 0.05em black;
}

.legendRelation20 {
    background: v-bind(relationColor);
    filter: brightness(160%);
    height: 100%;
    text-align: center;
    font-size: 200%;
    color: rgb(240, 227, 227);
    text-shadow:
        0.05em 0 black,
        0 0.05em black,
        -0.05em 0 black,
        0 -0.05em black,
        -0.05em -0.05em black,
        -0.05em 0.05em black,
        0.05em -0.05em black,
        0.05em 0.05em black;
}

.legendRelation40 {
    background: v-bind(relationColor);
    filter: brightness(120%);
    height: 100%;
    text-align: center;
    font-size: 200%;
    color: rgb(240, 227, 227);
    text-shadow:
        0.05em 0 black,
        0 0.05em black,
        -0.05em 0 black,
        0 -0.05em black,
        -0.05em -0.05em black,
        -0.05em 0.05em black,
        0.05em -0.05em black,
        0.05em 0.05em black;
}

.legendRelation60 {
    background: v-bind(relationColor);
    filter: brightness(80%);
    height: 100%;
    text-align: center;
    font-size: 200%;
    color: rgb(240, 227, 227);
    text-shadow:
        0.05em 0 black,
        0 0.05em black,
        -0.05em 0 black,
        0 -0.05em black,
        -0.05em -0.05em black,
        -0.05em 0.05em black,
        0.05em -0.05em black,
        0.05em 0.05em black;
}

.legendRelation80 {
    background: v-bind(relationColor);
    filter: brightness(40%);
    height: 100%;
    text-align: center;
    font-size: 200%;
    color: rgb(240, 227, 227);
    text-shadow:
        0.05em 0 black,
        0 0.05em black,
        -0.05em 0 black,
        0 -0.05em black,
        -0.05em -0.05em black,
        -0.05em 0.05em black,
        0.05em -0.05em black,
        0.05em 0.05em black;
}
</style>
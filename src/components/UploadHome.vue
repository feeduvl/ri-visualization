<template>
    <div id="file-upload-panel" width="100%">
        <div id="file-upload-panel-inner">
            <div>
                <input id="file-input-field" type='file' hidden @change="getFileName"/>
                <label v-if="!uploadedFile" for="file-input-field" class="file-action-button file-picker-button">Choose file</label>
                <label v-else id="submit-file-button" class="file-action-button" :style="uploadButtonStyle" :enabled=uploadedFile @click="persistFile(fileDisplayName)">Submit</label>
                <span id="file-chosen-display">{{fileDisplayName}}</span>
            </div>
            <div id="upload-sendoff" v-if="uploadedFile" width="100%">
                <span>
                    Here are some instructions on the supported file format
                </span>
            </div>

        </div>
    </div>
</template>

<script>
    import{
        BLUE_BORDER
    } from "../colors";

    export default {  // TODO add attribute 'multiple' on file input to allow selection of multiple files
        name: "UploadHome",
        data: function(){
            return {
                isMounted: false,
                uploadedFile: undefined,
                uploadButtonStyle: {
                    "background-color": BLUE_BORDER
                }
            }
        },
        mounted() {
            this.isMounted = true;

            //  add some computed CSS stuff
            let halfwidth;
            let parentwidth = document.getElementById("file-upload-panel").getBoundingClientRect().width;
            halfwidth = Math.floor(-1*parentwidth/2);
            document.getElementById("file-upload-panel-inner").style["margin"] = "0 0 0 "+ halfwidth+"px";

        },
        computed: {
            fileInputField(){
                return document.getElementById("file-input-field");
            },
            fileDisplayName(){
                if(this.uploadedFile){
                    return this.uploadedFile.name;
                }
                return "No file chosen"
            }
        },
        methods: {
            persistFile(data){
                window.alert("File has been persisted: "+data);
            },
            getFileName(){
                this.uploadedFile = this.fileInputField.files[0];
            }

        }
    }
</script>

<style scoped>
    #file-upload-panel{
        position: absolute;
        top: 200px;
        left: 50%;
    }

    .file-action-button{
        color: white;
        padding: 0.5rem;
        font-family: sans-serif;
        border-radius: 0.3rem;
        cursor: pointer;
        margin-top: 1rem;
    }
    .file-picker-button{
        background-color: indigo;
    }
    #file-chosen-display{
        margin-left: 0.3rem;
        font-family: sans-serif;
    }

    #upload-sendoff{
        margin-top: 20px;
    }

</style>

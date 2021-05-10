<template>
    <div>This is the upload view for uploading files
    <input id='fileholder' type='file' name='filename' hidden/>
    <label for="fileholder" class="file-upload">Choose file</label>
    <span id="file-chosen">{{fileName}}</span>
    <button :enabled=hasFile @click="persistFile(fileName)"></button></div>
</template>

<script>
    export default {
        name: "UploadHome",
        data: function(){
            return {
                isMounted: false
            }
        },
        mounted() {
            this.isMounted = true;
        },
        computed: {
            fileholder(){
                return document.getElementById("fileholder");
            },
            hasFile(){
                if(!this.isMounted){
                    return false;
                }
                return this.fileholder.files !== undefined;
            },
            fileName(){
                let defaultName = "No file chosen";
                if(!this.isMounted || !this.hasFile) {
                    return defaultName;
                }
                return this.fileholder.files[0].name;
            }
        },
        methods: {
            persistFile(data){
                window.alert("File has been persisted: "+data);
            }
        }
    }
</script>

<style scoped>
    .file-upload{
        background-color: indigo;
        color: white;
        padding: 0.5rem;
        font-family: sans-serif;
        border-radius: 0.3rem;
        cursor: pointer;
        margin-top: 1rem;
    }
    #file-chosen{
        margin-left: 0.3rem;
        font-family: sans-serif;
    }

</style>

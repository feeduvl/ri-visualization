<template>
    <v-container class="crawler-settings">
        <v-card>
            <v-card flat class="header">
                <v-card-title primary-title>
                    <h1>App Review Crawler</h1>
                </v-card-title>
            </v-card>
        </v-card>


        <v-card>
            <v-card-title primary-title>
                    <h2>Crawler Settings</h2>
                </v-card-title>

            <v-container class="crawler-settings-input">
                <v-form v-model="isFormValid">
                    <!-- Text field for subreddit and collection name -->
                    <v-container class="App-selection">
                        <!-- Using chips to enter multiple subreddit names -->
                        <v.card>
                            <v-text-field
                                v-model="appName"
                                label="Enter name of the respective app"
                                :rules="[rules.required]"
                            ></v-text-field>
                        </v.card>
                        <v-card>
                            <v-text-field
                                v-model="appURL"
                                label="Enter url of the respective app"
                                :rules="[rules.required]"
                            ></v-text-field>
                        </v-card>

                        <v-card>
                            <v-text-field
                                v-model="datasetName"
                                label="Enter name of new dataset"
                                :rules="[rules.required]"
                        ></v-text-field>
                        </v-card>
                    </v-container>

                    <!-- Switch selection method for posts -->
                    <v-card
                        flat
                        color="transparent"
                    >
                        <v-radio-group
                        v-model="postSelection"
                        column
                        >
                            <v-radio
                                label="German"
                                value="de"
                            ></v-radio>
                            <v-radio
                                label="English"
                                value="en"
                            ></v-radio>
                        </v-radio-group>
                    </v-card>

                    <!-- Set limit for number of posts -->
                    <v-card
                        flat
                        color="transparent"
                    >
                        <v-text-field
                            :rules="[rules.limit, rules.required]"
                            v-model="postNewLimit"
                            label="Maximum Number of Posts"
                            placeholder="100"
                        ></v-text-field>
                    </v-card>

                    <!-- Timeframe selection using a date selection -->
                    <v-card
                        flat
                        color="transparent"
                    >
                    <v-text-field
                        v-model="dateFrom"
                        label="From Date in DD/MM/YYYY"
                        :rules="[rules.date]"
                        prepend-icon="event"
                        v-on="on"
                    ></v-text-field>
                    
                    <v-text-field
                        v-model="dateTo"
                        label="To Date in DD/MM/YYYY"
                        :rules="[rules.date]"
                        prepend-icon="event"
                        v-on="on"
                    ></v-text-field>
                    </v-card>

                    <!-- Selection of emoji/URL handling -->
                    <v-container fluid>
                        <v-checkbox
                            v-model="replaceURLS"
                            :label="`Remove URLs`"
                        ></v-checkbox>
                        <v-checkbox
                            v-model="replaceEmojis"
                            :label="`Remove emojis`"
                        ></v-checkbox>
                    </v-container>

                    <!-- Selection of minimum lengths for text bodies -->
                    <v-card
                        flat
                        color="transparent"
                    >
                        <v-subheader>Set mininum lengths for contents of submissions</v-subheader>
                        <v-text-field
                            v-model="minTextLength"
                            :rules="[rules.limit, rules.required]"
                            label="Minimum Review Length"
                            placeholder="200"
                            type="number"
                        ></v-text-field>
                    </v-card>

                    <!-- Blacklist using chips -->
                    <v-card>
                        <v-combobox
                            v-model="blacklistChipsPosts"
                            :items="blacklistItemsPosts"
                            chips
                            clearable
                            label="Enter blacklisted words for post filtering"
                            multiple
                        >
                        </v-combobox>
                    </v-card>
                </v-form>
            </v-container>
        </v-card>

        <v-card>
            <v-checkbox
                v-model="schedule"
                label="Make crawler run reoccur according to time window specified above"
            ></v-checkbox>
            <v-btn
                class="ma-2"
                :disabled="!isFormValid"
                :loading="$store.state.isLoadingAppReviewCrawler"
                color="secondary"
                @click="crawlerRun"
                >
                Run
            </v-btn>
        </v-card>

        <v-card>
            <v-card flat class="header">
                <v-card-title>
                    <h1>Job Overview</h1>
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <v-icon
                                    @click="reloadFields"
                                    v-bind="attrs"
                                    v-on="on"
                                    id="reload-btn"
                            >
                                refresh
                            </v-icon>
                        </template>
                        <span>Reload</span>
                    </v-tooltip>
                    <v-spacer></v-spacer>
                    <v-spacer></v-spacer>
                    <v-spacer></v-spacer>
                    <v-text-field
                            v-model="search"
                            append-icon="search"
                            label="Seach for crawling job"
                            single-line
                            hide-details
                            clearable
                    ></v-text-field>
                </v-card-title>
            </v-card>

            <v-data-table
                :headers="tableHeaders"
                :items="crawlerJobs"
                :items-per-page="5"
            >
                <template v-slot:items="props">
                    <td>{{ props.item.app_name }}</td>
                    <td>{{ props.item.date }}</td>
                    <td>{{ props.item.app_occurrence }}</td>
                    <td>{{ props.item.dataset_name }}</td>
                    <td><span class="icon-column">
                            <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                              <v-icon
                                      small
                                      @click="stopJobReoccurance(props.item)"
                                      v-bind="attrs"
                                      v-on="on"
                              >
                                cancel
                              </v-icon>
                            </template>
                            <span>Stop Reoccurance</span>
                          </v-tooltip>
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                              <v-icon
                                      small
                                      @click="deleteCrawlerJob(props.item)"
                                      v-bind="attrs"
                                      v-on="on"
                              >
                                delete
                              </v-icon>
                            </template>
                            <span>Delete Entry</span>
                          </v-tooltip>
                        </span></td>
                </template>
            </v-data-table>
        </v-card>
    </v-container>
</template>

<script>
    export default {
        name: "AppReviewCrawler",
        data: () => ({
            appName: '',
            appURL: '',
            datasetName: '',
            collectionNamesItems: [],
            postSelection: 'de',
            postNewLimit: 100,
            dateTo: '',
            dateFrom: '', 
            replaceSettings: [],
            minTextLength: 200,
            blacklistChipsPosts: [],
            blacklistItemsPosts: [],
            replaceURLS: false,
            replaceEmojis: false,
            schedule: false,
            occurrence_days: 0,

            tableHeaders: [
                    {
                        text: "App",
                        sortable: true,
                        width: "25%",
                        value: "app_name"
                    },
                    {
                        text: "Date",
                        align: "center",
                        sortable: true,
                        width: "20%",
                        value: "date",
                        filterable: false,
                    },
                    {
                        text: "Occurrence",
                        align: "center",
                        sortable: true,
                        width: "10%",
                        value: "app_occurrence",
                        filterable: false,
                    },
                    {
                        text: "Dataset",
                        align: "left",
                        sortable: false,
                        value: "dataset_name",
                        width: "25%",
                        filterable: false,
                    },
                    {
                        text: "Actions",
                        align: "center",
                        sortable: false,
                        value: 'actions',
                        width: "20%",
                    },
                ],

            rules: {
                required: value => !!value || 'Required.',
                limit: value => value >= 0 || 'Numeric non-zero input required',
                date: value => {
                    const pattern = /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/
                    return pattern.test(value) || 'Invalid date.'
                },
            }
    }),

    computed: {
        
        crawlerJobs() {
            return this.$store.state.finishedAppReviewCrawlerJobs
        }

    },

    mounted() {
        this.reloadFields();

        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();

        this.dateTo = dd + '/' + mm + '/' + yyyy;
        this.dateFrom = this.dateTo;
    },

    methods: {
        crawlerRun(){
            let crawlerTask = {
                app_name: this.appName,
                app_url: this.appURL,
                dataset_name : this.datasetName,
                date_from : this.dateFrom,
                date_to : this.dateTo,
                post_selection: this.postSelection,
                new_limit: Number(this.postNewLimit),
                min_length_posts : Number(this.minTextLength),
                blacklist_posts : this.blacklistChipsPosts,
                replace_urls : this.replaceURLS,
                replace_emojis : this.replaceEmojis
            }
            let crawlerTaskString = JSON.stringify(crawlerTask)

            // dispatch crawler task
            this.$store.dispatch("actionCrawlApp", crawlerTaskString)

            // store crawler job
            console.log("occurrence: "+this.schedule)
            if (this.schedule) {
                var date_From = this.date_from;
                console.log(date_From)
                date_From = new Date(date_From.split('/')[2],date_From.split('/')[1]-1,date_From.split('/')[0]);
                var date_To = this.date_to;
                console.log(date_To)
                date_To = new Date(date_To.split('/')[2],date_To.split('/')[1]-1,date_To.split('/')[0]);
                const diffTime = Math.abs(new Date(date_To.getTime() - date_From.getTime()));
                console.log(diffTime)
                this.occurrence_days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                console.log(this.occurrence_days)
            }
            
            let crawlerTaskInDB = {
                app_name:this.appName,
                app_url: this.appURL,
                date: new Date(),
                app_occurrence: this.occurrence_days,
                app_number_posts: 0,
                dataset_name: this.datasetName,
                // request data
                request: crawlerTask,
            }

            let crawlerTaskInDBString = JSON.stringify(crawlerTaskInDB)
            this.$store.dispatch("actionPostAppReviewCrawlerJobData", crawlerTaskInDBString)
        },

        deleteCrawlerJob(job){  
                console.log(job);
                this.$store.dispatch("actionDeleteAppReviewCrawlerJobs", job.date)
                //this.crawlerJobDelete = null;
                this.reloadFields()
        },

        stopJobReoccurance(job){
            this.$store.dispatch("actionAppReviewCrawlerStopOccurrence", job.date)
            this.reloadFields()
        },

        reloadFields(){
            this.$store.dispatch("actionGetAppReviewCrawlerJobs")
        }
    }
    
  }

</script>

<style scoped>
    .icon-column  {
        display: flex;
        justify-content: center;
    }

    .header {
        margin-top: 20px;
    }

    .card-title-text {
        font-size: 2em;
        text-align: center;
    }

    table.v-table tbody tr,
    table.v-table tbody td,
    table.v-table tbody th {
        min-height: 50px;
        height: 50px;
        max-height: 50px;
    }

    .row-item {
        margin: 15px 10px 15px 10px;
    }

    .row-header {
        margin: 15px 10px 35px 10px;
        position: fixed;
    }

    .action-left {
        margin-right: 5px;
    }

    .action-right {
        margin-left: 5px;
    }

    h1 {
        text-align: center;
    }

    .list-enter,
    .list-leave-to {
        transition: all 0.5s;
        opacity: 0;
    }

    .backgroundcolor-red {
        background-color: rgba(255, 0, 0, 0.04);
    }

    .backgroundcolor-yellow {
        background-color: rgba(255, 249, 196, 0.5);
    }

    .backgroundcolor-grey {
        background-color: rgba(238, 238, 238, 0.04);
    }

    .spacing {
        padding-top: 0;
    }

    .pointer {
        cursor: pointer;
    }

    .toggle-effect {
        background-color: #bdbdbd !important;
    }

    .anti-margin {
        margin-bottom: 0 !important;
    }

    #service-status {
        padding-left: 0;
        padding-top: 25px;
    }

    #reload-btn {
        margin-left: 10px;
    }

    table.v-table tbody td:first-child, table.v-table tbody td:not(:first-child), table.v-table tbody th:first-child, table.v-table tbody th:not(:first-child), table.v-table thead td:first-child, table.v-table thead td:not(:first-child), table.v-table thead th:first-child, table.v-table thead th:not(:first-child) {
        padding: 0 8px;
    }

    .dialog-title {
        font-weight: 500;
    }

    .custom-loader {
    animation: loader 1s infinite;
    display: flex;
  }
  @-moz-keyframes loader {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
  @-webkit-keyframes loader {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
  @-o-keyframes loader {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
  @keyframes loader {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }

</style>
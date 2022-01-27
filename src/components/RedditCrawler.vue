<template>
    <v-container class="crawler-settings">
        <v-card>
            <v-card flat class="header">
                <v-card-title primary-title>
                    <h1>Reddit Crawler</h1>
                </v-card-title>
            </v-card>
        </v-card>

        <!--
        <v-row>
            <v-col cols="12" sm="6" md="3">
                <v-card>
                    <h1> left </h1>
                </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="3">
                <v-card>
                    <h1> right </h1>

                </v-card>
            </v-col>
        </v-row>
        -->
        

        <v-card>
            <v-card-title primary-title>
                    <h2>Crawler Settings</h2>
                </v-card-title>

            <v-container class="crawler-settings-input">

                <!-- Text field for subreddit name -->
                <v-container class="subreddit-selection">
                    <!-- Blacklist using chips to enter multiple subreddit names -->
                    <v-card>
                        <v-combobox
                            v-model="subredditNamesChips"
                            :items="subredditNamesItems"
                            chips
                            clearable
                            label="Enter Subreddit Names for Crawling Jobs"
                            multiple
                        >
                            <!-- Find out how to delete tags -->
                        </v-combobox>
                    </v-card>
                </v-container>


                <!-- Timeframe selection using a date selection -->
                <v-card
                    flat
                    color="transparent"
                >
                  <v-text-field
                    v-model="dateFrom"
                    label="From Date in DDMMYYYY"
                    prepend-icon="event"
                    v-on="on"
                  ></v-text-field>
                  
                  <v-text-field
                    v-model="dateTo"
                    label="To Date in DDMMYYYY"
                    prepend-icon="event"
                    v-on="on"
                  ></v-text-field>
                </v-card>

                <!-- Comment-depth selection using a rangeslider -->
                <v-card
                    flat
                    color="transparent"
                >
                    <v-subheader>Select Comment Extraction Depth</v-subheader>
                    <v-card-text>
                        <v-row>
                            <v-col class="pa-12">
                            <v-range-slider
                                :tick-labels="commentOptions"
                                :value="[0, 1]"
                                min="0"
                                max="6"
                                ticks="always"
                                tick-size="4"
                            >
                            </v-range-slider>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
                

                <!-- Selection of emoji/URL handling -->
                <v-container fluid>
                    <v-checkbox
                        v-model="replaceURLS"
                        :label="`Replace URLs with placeholder`"
                    ></v-checkbox>
                    <v-checkbox
                        v-model="replaceEmojis"
                        :label="`Replace emojis with placeholder`"
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
                        label="Minimum Post Length"
                        placeholder="200"
                    ></v-text-field>
                    <v-text-field
                        v-model="minCommentLength"
                        label="Minimum Comment Length"
                        placeholder="5"
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

                    <v-combobox
                        v-model="blacklistChipsComments"
                        :items="blacklistItemsComments"
                        chips
                        clearable
                        label="Enter blacklisted words for comment filtering"
                        multiple
                    >
                    </v-combobox>
                </v-card>

            </v-container>
        </v-card>

        <v-card>
            <v-btn
                class="ma-2"
                :loading="isLoading"
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

        </v-card>
            <v-data-table>
                <!--- TODO fill with data from past crawling jobs --> 
            </v-data-table>
    </v-container>
    
    
    
    
</template>

<script>
    export default {
        name: "RedditCrawler",
        data: () => ({
            subredditNamesChips: [], 
            subredditNamesItems: [],
            dateTo: '',
            dateFrom: '', 
            commentOptions: ['None', 1, 2, 3, 4, 5, 'All'],
            replaceSettings: [],
            minTextLength: '',
            minCommentLength: '',
            blacklistChipsPosts: [],
            blacklistItemsPosts: [],
            blacklistChipsComments: [],
            blacklistItemsComments: [],
            replaceURLS: false,
            replaceEmojis: false,
            isLoading: false
    }),

    methods: {
        crawlerRun(){
            this.isLoading = true
            let crawlerTask = {
                subreddits : this.subredditNamesChips,
                date_from : this.dateFrom,
                date_to : this.dateTo,
                min_length_posts : this.minTextLength,
                min_length_comments : this.minCommentLength,
                blacklist_comments : this.blacklistChipsComments,
                blacklist_posts : this.blacklistChipsPosts,
            }
            let crawlerTaskString = JSON.stringify(crawlerTask)

            // dispatch
            this.$store.dispatch("actionCrawlReddit", crawlerTaskString)
            
            this.isLoading = false
        },

        reloadFields(){
            // TODO
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
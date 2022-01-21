<template>
  <v-card>
    <v-card-title>
      <h2>Annotation Selection</h2>
      <v-spacer></v-spacer>
      <v-text-field
          v-model="search"
          append-icon="search"
          label="Search for Annotation Name"
          single-line
          hide-details
      ></v-text-field>
    </v-card-title>
    <v-data-table
        v-model="selected"
        :headers="headers"
        :items="availableAnnotations"
        :search="search"
        :pagination.sync="pagination"
        select-all
        item-key="name"
        class="elevation-1"
    >
      <template v-slot:headers="props">
        <tr>
          <th>
            <v-checkbox
                :input-value="props.all"
                :indeterminate="props.indeterminate"
                primary
                hide-details
                @click.stop="toggleAll"
            ></v-checkbox>
          </th>
          <th
              v-for="header in props.headers"
              :key="header.text"
              :class="['column sortable', pagination.descending ? 'desc' : 'asc', header.value === pagination.sortBy ? 'active' : '']"
              @click="changeSort(header.value)"
          >
            <v-icon small>arrow_upward</v-icon>
            {{ header.text }}
          </th>
        </tr>
      </template>
      <template v-slot:items="props">
        <tr :active="props.selected" @click="props.selected = !props.selected; addAnnotationToSelection()">
          <td>
            <v-checkbox
                :input-value="props.selected"
                primary
                hide-details
            ></v-checkbox>
          </td>
          <td style="text-align:center">{{ props.item.name }}</td>
        </tr>
      </template>
      <template v-slot:no-results>
        <v-alert :value="true" color="error" icon="warning">
          Your search for "{{ search }}" found no results.
        </v-alert>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
export default {
  name: "SelectableAnnotations.vue",
  props: {
    selectedDataset: String
  },
  watch: {
    selectedDataset: function(newVal, oldVal) { // watch it
      console.log('Prop changed: ', newVal, ' | was: ', oldVal)
    }},
  data: () => ({
    pagination: {
      sortBy: 'name'
    },
    selected: [],
    search: '',
    headers: [
      {
        text: 'Annotation Name',
        align: 'left',
        value: 'name'
      },
    ],
  }),
  computed: {
    availableAnnotations() {
      return this.$store.state.available_annotations.filter( a =>
          a.dataset === this.selectedDataset
      )
    }
  },

  methods: {
    addAnnotationToSelection() {
      this.$emit('selectAnnotation', this.selected)
    },
    toggleAll () {
      if (this.selected.length) this.selected = []
      else this.selected = this.availableAnnotations.slice()
      this.$emit('selectAnnotation', this.selected)
    },
    changeSort (column) {
      if (this.pagination.sortBy === column) {
        this.pagination.descending = !this.pagination.descending
      } else {
        this.pagination.sortBy = column
        this.pagination.descending = false
      }
    }
  }
}
</script>

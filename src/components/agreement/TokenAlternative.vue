<template functional>
        <span
            @click.exact="listeners['agreement-token-click'](props.index)"

            :id="'token_'+props.index"
            class="agreement-token-inner"
            :class="['token-inner-default',
            props.show_pos ? props.posClass:'token-outer-default', 'whitespace',
            {
              isResolved: props.isResolved,
              isUnresolved: props.isResolved === false,
              highlightClickedToken: (( props.agreementInputVisible) && (props.isClicked===props.index)), // currently SELECTED code
            }]">
          {{props.name}}
        </span>
</template>

<script>

    export default {
        name: "TokenAlternative",
        functional:true,

        props: {
            name: {
                type: String,
                required: true
            },
            lemma: String,
            pos: String,
            tore: String,
            index: {
                type: Number,
                required: true
            },

            isClicked: {
                type: Number,
                required: true
            },

            isResolved: {
                type: Boolean,
                required: true
            },

            agreementInputVisible: {
                type: Boolean,
                required: true
            }
        }
    }
</script>

<style scoped>

    .token-inner-default{
        color: black;
        font-size: 18px;
        user-select: none;
        border: 2px solid transparent;
    }

    .n, .v, .a{
        border: 2px solid;
    }

    .n {
        border-color: #bd3518;
    }

    .v {
        border-color: #002aff;
    }

    .a {
        border-color: #3cff3c;
    }

    .whitespace {
        margin-right: 0.7em;
    }

    .isUnresolved {
        background-color: #e16144;
    }

    .isResolved {
        background-color: #66f877;
    }

    .isAlgoLemma {
      border: #ff6781 solid 2px;
    }
    .linkedTogether {
        border: #0066ff solid 2px;
    }

    .highlightInSelectedCode {
      border: black solid 2px;
    }

</style>
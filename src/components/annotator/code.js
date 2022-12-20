/**
 * Style guidelines:
 *
 * Method arguments are always OBJECTS, which are then stored and accessed by index through the vuex store.
 *
 * Constructor arguments are indices used to set a constant unique key
 *
 * Index sets may include null values! (so don't use unchecked .includes(null) type queries)
 */


/**
 * Model a Code.
 * Type 1 Code instances have a non-empty name but an empty TORE designator
 * Type 2 Code instances have a non-empty TORE-code and may have a name
 * @param index
 * @constructor
 */
function Code(index){
    this.tokens = []  // contains indices of constituent tokens
    this.name = ""
    this.tore = ""
    this.index = index;  // incremented from 0
    this.relationship_memberships = []  // contains indices of relationships it owns
}

function Code_user_display_prompt(code){
    if(code.name && !code.tore){
        return "Name: '"+code.name+"'";
    } else if (!code.name && code.tore){
        return "Category: '"+code.tore+"'"
    } else if(code.name && code.tore){
        return "Name: '"+code.name + "' Category: '"+code.tore+"'";
    } else {
        return `[Code without name or Category]`
    }
}

function Code_add_relationship(code, relationship){
    if(code.relationship_memberships.includes(relationship.index)){
        console.warn("Attempted to add a relationship to a code which already owns it")
    } else {
        code.relationship_memberships.push(relationship.index)
    }
}

function Code_remove_token(state, commit, code, token){
    if(code.tokens.length > 1 && code.tokens.includes(token.index)){
        if(code.name){
            state.token_num_name_codes[token.index]--;
        }
        if(code.tore){
            state.token_num_tore_codes[token.index]--;
        }

        let tokenIndex = code.tokens.indexOf(token.index)
        code.tokens.splice(tokenIndex, 1)
    }
}

function Code_update_token(state, commit, code, token){
    if(!code.tokens.includes(token.index)){
        //state.tokens[token.index].num_codes++;  FIXME use helper data structure
        if(code.name){
            state.token_num_name_codes[token.index]++;
        }
        if(code.tore){
            state.token_num_tore_codes[token.index]++;
        }

        code.tokens.push(token.index);
    }
}

function Code_remove_relationship(code, tore_relationship){
    let ind = tore_relationship.index;
    console.log("ReL:" + tore_relationship);
    console.log("Index: " + ind);
    console.log(code.relationship_memberships)
    if (!code.relationship_memberships.includes(ind)) {
        console.error("Attempted to remove non-existent relationship: " + ind + " from Code: " + CodeToString(code));
    } else {
        code.relationship_memberships.splice(code.relationship_memberships.indexOf(ind), 1);
    }
}

function Code_remove_all_relationships(code){
    code.relationship_memberships.splice(0,code.relationship_memberships.length);
}

/**
 * Create a new TORE Relationship from required, non-falsy attributes
 * Does not add this relationship to the code!
 * @param toreEntity is a Code with non-empty TORE designator
 * @param target_tokens a set of token indices that are the target of this relationship
 * @param index required index incremented from 0
 * @constructor
 */

function TORERelationship(toreEntity, target_tokens, index){
    this.TOREEntity = toreEntity.index  // just a Code index with tore !== ""
    this.target_tokens = target_tokens
    this.relationship_name = ""
    this.index = index;  // incremented from 0
}

function TORERelationship_set_relationship_name(toreRelationship, relationship_name) {
    toreRelationship.relationship_name = relationship_name
}

function TORERelationship_add_token(toreRelationship, token){

    if(!toreRelationship.target_tokens.includes(token.index)){
        toreRelationship.target_tokens.push(token.index);
        return true;
    } else {
        console.warn("Attempted to add token to TORERelationship which already has that token")
        return false;
    }
}

function TORERelationship_remove_token(toreRelationship, token){
    if(!toreRelationship.target_tokens.includes(token.index)){
        console.warn("Attempted to remove a token from a relationship which doesn't include it")
    } else {
        let tokenIndex = toreRelationship.target_tokens.indexOf(token.index)
        toreRelationship.target_tokens.splice(tokenIndex, 1)
    }
}

function CodeToString(code){
    return "[Code] Name: "+code.name+", tore: "+code.tore+", index: "+code.index+", relationship memberships: "+code.relationship_memberships;
}

function getToreHighlightColor(str){
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        var color = '#';
        for (var m = 0; m < 3; m++) {
            var value = (hash >> (m * 8)) & 0xFF;
            color += ('00' + value.toString(16)).substr(-2);
        }
        return color;
}

export {Code_user_display_prompt, Code_remove_token, TORERelationship_remove_token, Code_add_relationship, Code_update_token, Code_remove_relationship, Code_remove_all_relationships, CodeToString, TORERelationship_set_relationship_name, TORERelationship_add_token, getToreHighlightColor, Code, TORERelationship}
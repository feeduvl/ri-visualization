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
    let hasName = code.name !== "";
    let hasTore = code.tore !== "";
    if(hasName && !hasTore){
        return "Name: "+code.name;
    } else if (!hasName && hasTore){
        return "TORE: "+code.tore
    } else if(hasName && hasTore){
        return "Name: "+code.name + " TORE: "+code.tore;
    } else {
        return `[Code without name or TORE]`
    }
}

function Code_add_relationship(code, relationship){
    if(code.relationship_memberships.includes(relationship.index)){
        console.warn("Attempted to add a relationship to a code which already owns it")
    } else {
        code.relationship_memberships.push(relationship.index)
    }
}

function Code_add_token(state, commit, code, token){
    if(!code.tokens.includes(token.index)){
        let newToken = {...token}
        let newTokens = [...state.tokens]
        newToken.num_codes++;
        newTokens[token.index] = newToken
        Object.freeze(newTokens)
        state.tokens = newTokens
        code.tokens.push(token.index);

        commit("updateDocTokens")
    } else {
        console.warn("Attempted to add token to Code which already has that token")
    }
}

function Code_remove_relationship(code, tore_relationship){
    let ind = tore_relationship.index;
    if (!code.relationship_memberships.includes(ind)) {
        console.error("Attempted to remove non-existent relationship: " + ind + " from Code: " + CodeToString(code));
    } else {
        code.relationship_memberships.splice(code.relationship_memberships.indexOf(ind), 1);
    }
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

export {Code_user_display_prompt, TORERelationship_remove_token, Code_add_relationship, Code_add_token, Code_remove_relationship, CodeToString, TORERelationship_set_relationship_name, TORERelationship_add_token, Code, TORERelationship}
/**
 * Style guidelines:
 *
 * Method arguments are always OBJECTS, which are then stored and accessed by index through the vuex store.
 *
 * Constructor arguments are indices used to set a constant unique key
 *
 * Index sets may include null values! (so don't use unchecked .includes(null) type queries)
 */


function TokenCluster(index){
    this.tokens = []  // contains indices of constituent tokens
    this.name = ""
    this.tore = null
    this.index = index;  // incremented from 0
    this.relationship_memberships = []  // contains indices of relationships it is a part of


    /**
     * We need the state variable because the token_cluster attribute is actually a computed property in a vue component, not the underlying object in state
     * @param state
     * @param token
     * @return false IF allocation failed BECAUSE the token was already assigned to another cluster ELSE true
     */
    this.add_token = function(token){
        if(token.token_cluster !== null && token.token_cluster !== this.index){
            console.error("token_cluster::add_token attempted to add already allocated token to token cluster")
            return false;
        } else {
            if(!this.tokens.includes(token.index)){
                token.token_cluster = this.index;
                this.tokens.push(token.index);
            }
            return true;
        }
    }

    this.add_cluster_relationship = function(cluster_relationship){
        if(!this.relationship_memberships.includes(cluster_relationship.index)){
            this.relationship_memberships.push(cluster_relationship.index);
            cluster_relationship.add_cluster(this);
        }
    }

    this.remove_relationship = function(cluster_relationship){
        let size = this.relationship_memberships.length;
        this.relationship_memberships = this.relationship_memberships.filter(i => i !== cluster_relationship.index);

        if(size > this.relationship_memberships.length){
            cluster_relationship.remove_cluster(this);
        }
    }
}

function ClusterRelationship(index){
    this.token_clusters = []  // contains indices of token clusters
    this.relationship_names = []
    this.index = index;  // incremented from 0

    this.add_cluster = function(token_cluster){
        if(!this.token_clusters.includes(token_cluster.index)){
            this.token_clusters.push(token_cluster.index);
            token_cluster.add_cluster_relationship(this);
        }
    }

    this.remove_cluster = function(token_cluster){
        let size = this.token_clusters.length;
        this.token_clusters = this.token_clusters.filter(i => i !== token_cluster.index);

        if(size > this.token_clusters.length){
            token_cluster.remove_relationship(this);
        }
    }

    this.set_relationship_name = function(cluster, relationship_name){
        let cluster_index = cluster.index;
        this.relationship_names.filter(obj => obj.cluster_index!==cluster_index);
        this.relationship_names.push({cluster_index, relationship_name:relationship_name===undefined?null:relationship_name})
    }
}


export {TokenCluster, ClusterRelationship}
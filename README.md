# Search Microservice
This is an Elasticsearch application indexing all incoming data of articles applying mapping(Schema) on it then adding it in Index(Database). All the indexed data will be replicated which makes Elasticsearch really High redundant system.
This Microservice will use native Elasticsearch client for Node.js which makes it very easy to intergrate. There are three major parts in this application,
* Initiating
* Mapping
* Indexing
* Searching
* Suggestions

Everytime appication is restarted Initiation and Mapping gets performed, Indexing and Searching are done on API call.

##Prerequisites
* Docker-engine
* Elasticsearch Docker Container

##Build-up
Start Docker Engine and Elasticsearch Container,
Run
`docker build --name <username>/search-service /path/to/search-service's/Dockerfile`
in your terminal and then,
`docker run -it --link elasticsearch:search <username>/search-service bash`
This service will work on port 8080.

##API
There are two API calls in this Microservice. The first one is `POST localhost:8080/index` with JSON data having structure as designed in mapping. This service have example mapping as,
```javascript
elasticClient.indices.putMapping({
    index:'publishedDoc',
    type:'document',
    body:{
        properties:{
            title:{type:String},
            shortScript:{type:String},
            id:String
        }
    }
});
```
constituting three properties as "Title", "ShortScript" and "ID" which are sent when a match is found while searching.

And the second API call is as `GET localhost:8080/search?query=<terms>`, which calls search function of Elasticsearch and triggers the below snippet,
```javascript
app.get('/search',function(req,res){
    elasticClient.search({
        index:'publishedDoc',
        type:'document',
        body:{
            query:{
                match:{
                    body:req.query.terms
                }
            }
        },
    }).then(function(result){
        res.render('result',{results:result.hits.hits,query:req.query});
    }),function(err){if(err) throw err};
});
```
`result.hits.hits` contains all the matching results. 

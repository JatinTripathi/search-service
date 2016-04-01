var elasticsearch = require('elasticsearch');

var elasticClient = new elasticsearch.Client({
    host: 'search:9200',
    log: 'info'
});

var indexName = "randomindex";

//For Checking the connection with elasticsearch
elasticClient.ping({
  // ping usually has a 3000ms timeout
  requestTimeout: Infinity,

  // undocumented params are appended to the query string
  hello: "elasticsearch!"
}, function (error) {
  if (error) {
    console.trace('elasticsearch cluster is down!');
  } else {
    console.log('All is well');
  }
});

/**
* Delete an existing index
*/
function deleteIndex() {
    return elasticClient.indices.delete({
        index: indexName
    });
}
exports.deleteIndex = deleteIndex;

/**
* create the index
*/
function initIndex() {
    return elasticClient.indices.create({
        index: indexName
    });
}
exports.initIndex = initIndex;

/**
* check if the index exists
*/
function indexExists() {
    return elasticClient.indices.exists({
        index: indexName
    });
}
exports.indexExists = indexExists;

function initMapping() {
    return elasticClient.indices.putMapping({
        index: indexName,
        type: "document",
        body: {
            properties: {
                title: { type: "string" },
                content: { type: "string" },
                suggest: {
                    type: "completion",
                    analyzer: "simple",
                    search_analyzer: "simple",
                    payloads: true
                }
            }
        }
    });
}
exports.initMapping = initMapping;

function addDocument(page) {
    return elasticClient.index({
        index: indexName,
        type: "document",
        body: {
            title: page.title,
            content: page.shortscript,
            suggest: {
                input: page.title.split(" "),
                output: page.title,
                payload: page.metadata || {}
            }
        }
    });
}
exports.addDocument = addDocument;

function getSuggestions(input) {
    return elasticClient.suggest({
        index: indexName,
        type: "document",
        body: {
            docsuggest: {
                text: input,
                completion: {
                    field: "suggest",
                    fuzzy: true
                }
            }
        }
    });
}
exports.getSuggestions = getSuggestions;

function getSearch(input){
    return elasticClient.search({
        index: indexName,
        type: "document",
        body: {
            query: {
                match: {
                    body: input
                }
            }
        }
    });
}

exports.getSearch = getSearch;

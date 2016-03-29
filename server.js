var express=require('express');
//var logger=require('./log/logger.js');
var morgan=require('morgan');
var path=require('path');
var elasticSearch=require('elasticsearch');
var bodyParser=require('body-parser');



//==============Express Config==================//
var app=express();
app.use(bodyParser.urlencoded({extended:false}));
//==========Search Config
var elasticClient=new elasticSearch.Client({
    host:'search:9200'});
//===============View Config
app.set('views',path.join(__dirname,'views'));
app.set('view engine','jade');
//===============Logger Config
//app.use(morgan(':method :url :status :response-time ms - :res[content-length]',{'stream':logger.stream}));



//=========================Initiate And Map=========================//
elasticClient.indices.create({
    index:'publishedDoc'
});

elasticClient.indices.putMapping({
    index:'publishedDoc',
    type:'document',
    body:{
        properties:{
            title:{type:String},
            shortScript:{type:String},
            id:String,
            suggest: {
                    type: "completion",
                    analyzer: "simple",
                    search_analyzer: "simple",
                    payloads: true
                }
        }
    }
});

//====================Index Routing Querying and Suggestion============//
//====================Indexing Documents
app.post('/index',function(req,res){
    elasticClient.index({
        index:'publishedDoc',
        type:'document',
        body:{
            title:req.body.title,
            shortScript:req.body.shortScript,
            suggest: {
                input: req.body.title.split(" "),
                output: req.body.title,
                payload: req.metadata || {}
            }
        }
    }).then(function(result){
        res.json(result);
    });
});


//===================Query Suggestion
app.get('/suggest',function(req,res,next){
    elasticClient.suggest({
        index:'publishedDoc',
        type:'document',
        body:{
            docsuggest:{
                text:req.query,
                completion:{
                    field:'suggest',
                    fuzzy:true
                }
            }
        }
    }).then(function(result){
        res.json(result);
        
    });
});

//===================Query SearchedTearms
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
    }).then(function(err,result){
        if(err) throw err;
        res.json(result);
        
    });
});

app.get('/editor',function(req,res){
    res.render('editor');
});


//==================Port Config==================//
var port=process.env.port||8080;
app.listen(port,function(){
    console.log('Server listening at port'+port+'!');
});

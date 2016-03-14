var express=require('express');
var logger=require('logger');
var morgan=require('morgan');
var path=require('path');
var elasticSearch=require('elasticsearch');


//==============Express Config==================//
var app=express();
var elasticClient=new elasticSearch.Client({
    host:'search',
    log:'./log/searchlogs'});

app.use('views',path.join(__dirname,'views'));
app.use('view engine','jade');

app.use(morgan(':method :url :status :response-time ms - :res[content-length]',{'stream':logger.stream}));


//====================Index Routing and Querying============//
app.get('/search',function(req,res){
    elasticClient.search({
        index:'publishedDoc',
        query:{
            match:{
                body:req.query.search
            }
        }
    }).then(function(resp){
        
    }),function(err){
        if(err) throw err;
    };
});


//==================Port Config==================//
var port=process.env.port||8080;
app.listen(port);
logger.info('Server listening at port'+port+'!');
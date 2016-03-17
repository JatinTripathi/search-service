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
            id:String
        }
    }
});



//====================Index Routing and Querying============//
//====================Mapping Documents
app.post('/index',function(req,res){
    elasticClient.index({
        index:'publishedDoc',
        type:'document',
        body:{
            title:req.body.title,
            shortScript:req.body.shortScript,
            id:req.body._id
            }
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
    }),function(err,result){
        if(err) throw err;
        res.render('test');
        
    };
});

app.get('/test',function(req,res){
    res.render('test');
});

app.get('/editor',function(req,res){
    res.render('editor');
});


//==================Port Config==================//
var port=process.env.port||8080;
app.listen(port,function(){
    console.log('Server listening at port'+port+'!');
});

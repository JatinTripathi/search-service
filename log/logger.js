var winston=require('winston');
winston.emitErrs=true;

var logger=new (winston.Logger)({
    transports:[
        new (winston.transports.Console)({
            level:'debug',
            timestamp:true,
            handleException:true,
            colorize:true
        }),
        new (winston.transports.File)({
            level:'debug',
            timestamp:true,
            handleExceptions:true,
            colorize:true,
            filename:'./log/logfile.log'
        })],
    exitOnError:false
});

module.exports=logger;
module.exports.stream={
    write:function(message,encoding){
        logger.info(message);
    }
};

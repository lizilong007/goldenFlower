//返回MIME的静态资源文件给客户端

var url=require('url');
var path=require('path');
var fs = require( 'fs' );

//添加MIME类型
var MIME_TYPE = {
    "css": "text/css",
    "gif": "image/gif",
    "html": "text/html",
    "ico": "image/x-icon",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "js": "text/javascript",
    "json": "application/json",
    "pdf": "application/pdf",
    "png": "image/png",
    "svg": "image/svg+xml",
    "swf": "application/x-shockwave-flash",
    "tiff": "image/tiff",
    "txt": "text/plain",
    "wav": "audio/x-wav",
    "wma": "audio/x-ms-wma",
    "wmv": "video/x-ms-wmv",
    "xml": "text/xml"
};

function serverStatic(request, response){
    var filePath;
    if( request.url === "/" ){
        filePath =   __dirname + "/index.html";
    } else{
        filePath = __dirname + "/" + url.parse(request.url).pathname;
    }

    fs.exists(filePath, function(err){
        if(!err){
            send404( response );
        }else{
            var ext = path.extname( filePath );
            ext = ext ? ext.slice(1) : 'unknown';
            var contentType = MIME_TYPE[ext] || "text/plain";
            
            fs.readFile(filePath, function(err, data){
                if(err){
                    send500( response );
                }else{
                    send200( response, contentType, data );
                }
            });//fs.readfile
        }
    })//path.exists

}

function send404(res){
    res.end('<h1 style="text-align:center;">404<p>file not found</p></h1>' );
}

function send500( resonse ) {
    resonse.writeHead( 500 );
    resonse.end( '<h1 style="text-align:center;">500<p>务器内部错误！</p></h1>' );
}

function send200( response, contentType, data ) {
    response.writeHead( 200, {'content-type':contentType} );
    response.end( data );
}

module.exports.serverStatic = serverStatic;

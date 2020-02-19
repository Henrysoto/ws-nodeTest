// DEPENDENCIES
const   fs       = require('fs'),
        winston  = require('winston'),
        path     = require('path');


// LOGS
const logger = winston.createLogger({
    level     : 'info',
    format    : winston.format.json(),
    transports: [
        new winston.transports.Console({ level: 'debug' }),
        new winston.transports.File({ filename: 'err.log', level: 'err' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});


// CONSTANTS
const Port = 8080


// STARTING HTTPS SERVER 
const server = require('http').createServer((req, res) => {

    let filePath = path.join(__dirname, '../client', req.url);
    //logger.info('FILE ASKED : ' + filePath);

    // Default page for visitor calling directly URL
    if (req.url == '/')
        filePath = path.join(__dirname, '../client', 'index.html');

    const extname = path.extname(filePath);
    let contentType = 'text/html';

    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;      
        case '.jpg':
            contentType = 'image/jpg';
            break;
        case '.wav':
            contentType = 'audio/wav';
            break;
    }

    let headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
        'Access-Control-Max-Age': 2592000, // 30 days
        'Content-Type': contentType
    };

    fs.readFile(filePath, function(err, content) {
        if (err) {
            if(err.code == 'ENOENT'){  
                res.writeHead(404, headers);
                res.end(content, 'utf-8');
            }
            else {
                res.writeHead(500, headers);
                res.end(content, 'utf-8');
            }
        }
        else {
            res.writeHead(200, headers);
            res.end(content, 'utf-8');
        }
    });

    if (req.method === 'OPTIONS') {
        res.writeHead(204, headers);
        res.end();
    }

}).listen(Port); 

let clients = []

//OPENING SOCKET
const io = require('socket.io')(server).on('connection', (socket) => {

    if (clients.indexOf(socket) == -1)
    {
        clients.push(socket);
        logger.info("SERVER > Socket opened from Client #" + clients.indexOf(socket));    
    }
    
    socket.on('disconnect', () => {
        clients.forEach((v, i) => {
            if (socket == v) clients.splice(i, 1);
            logger.info("SERVER > Client #" + i + " disconnected!");
            logger.info("Clients connected: " + clients.length);
        });
    });

    socket.on('message', (msg) => {
        io.emit('message', msg);
    });

});
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const app = express();

const PORT = 10001;

let numMessages = 0;

app.use(cors());

app.get('/file', (req, res) => {
    let id = numMessages++;

    const logInfo = (msg) => {
        console.log(`${new Date().toDateString()} [INFO] ${id}: ${msg}`);
    }
    
    const logError = (msg) => {
        console.log(`${new Date().toDateString()} [ERROR] ${id}: ${msg}`);
    }

    logInfo(`${req.url}`);
    let filePath = req.query['path'];
    if (!filePath) {
        const errorMsg = 'file path should exist.';
        logError(errorMsg);
        res.status(204);
        res.send(errorMsg)
        return;
    }

    filePath = path.join(filePath);
    if (!fs.existsSync(filePath)) {
        const errorMsg = `${filePath} not found.`;
        logError(errorMsg);
        res.status(204);
        res.send(errorMsg);
        return;
    }

    let range = req.header('Range');
    if (range) {
        let match = range.match(/bytes=(\d+)-(\d+)/);
        let start = parseInt(match[1]);
        let end = parseInt(match[2]);

        let chunks = [];
        const fileStream = fs.createReadStream(filePath, { start, end });
        fileStream.on('data', (chunk) => {
            chunks.push(chunk);
        })
        fileStream.on('end', () => {
            let buffer = Buffer.concat(chunks);
            logInfo(`read ${filePath} from ${start} to ${end}, size: ${buffer.length}`);
            res.writeHead(200, { 'Content-Length': buffer.length })
            res.end(buffer, 'binary');
        })
    }
    else {
        fs.readFile(filePath, 'utf-8', (err, data) => {
            res.send(data);
        })
    }
})

app.get('/', (req, res) => {
    res.send("hello");
})

app.listen(PORT, () => {
    console.log(`Listen on ${PORT} port`);
});
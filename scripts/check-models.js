const https = require('https');
const fs = require('fs');
require('dotenv').config();

const logFile = fs.createWriteStream('model-list.txt', { flags: 'w' });

function log(message) {
    logFile.write(message + '\n');
    process.stdout.write(message + '\n');
}

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    log('Error: GEMINI_API_KEY not found in env');
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

log(`Fetching models from: ${url}`);

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.models) {
                log('Available Models:');
                json.models.forEach(m => log(`- ${m.name} [Methods: ${m.supportedGenerationMethods ? m.supportedGenerationMethods.join(',') : 'all'}]`));
            } else {
                log('Error/No models found in response:' + JSON.stringify(json));
            }
        } catch (e) {
            log('Error parsing JSON: ' + e.message);
            log('Raw data: ' + data);
        }
    });
}).on('error', (err) => {
    log('Request Error: ' + err.message);
});

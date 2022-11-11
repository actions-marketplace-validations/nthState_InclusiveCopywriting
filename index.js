const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const path = require('path');

function checkFile(src, file, words) {
    try {
    
        core.info(`Reading...${src}${file}`)
        
        const data = fs.readFileSync(path.resolve(`${src}${file}`), 'utf8');

        const lines = data.split('\n')

        for (let line of lines) {
            const tokens = new Set(line.split(' '))
            let intersection = new Set([...tokens].filter(x => words.has(x)));
            if (intersection.size > 0) {
                return file
            }
        }

        
    } catch (err) {
        core.info(`Error...${err}`)
    }
    
    return undefined
}

async function main() {
    try {
        const src = core.getInput('src');
        const words = new Set((core.getInput('words') || '').split(',').map(t => t.trim()))
        const fileTypeFilter = core.getInput('fileTypeFilter');

        core.info('Starting...')
        
        const filesList = fs.readdirSync(src, (err, files) => files.filter((e) => path.extname(e).toLowerCase() === fileTypeFilter));
 
        const output = filesList.map(file => checkFile(src, file, words)).filter(n => n);

        core.setOutput("files", output);
        
        if (output.length > 0) {
            return core.setFailed(`Files contain bad words: ${output}`)
        }

    } catch (error) {
      core.setFailed(error.message);
    }
}

main()
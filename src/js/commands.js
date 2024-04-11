class Command {
    constructor() {}
    
    execute(...params) {
        console.log(params);
    }
}

class YTDownload extends Command {
    execute(...params) {
        // Logic already done in another project
    }
}
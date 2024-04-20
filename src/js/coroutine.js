class Coroutine {
    constructor(callback) {
        this.callback = callback;
        this.onError = (error) => console.error(`Coroutine Error: ${error}`);
        this.isRunning = false;
        this.generator = null;
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.generator = this.callback(); // Recreate the generator
            this.resume();
            // console.log(`Coroutine started!`);
        }
    }

    stop() {
        this.isRunning = false;
        // console.log(`Coroutine stopped!`);
    }

    resume() {
        if (!this.isRunning) return;

        try {
            const { value, done } = this.generator.next();

            if (!done) {
                // Schedule the next iteration of the generator
                setTimeout(() => this.resume(), 0);
            }
        } catch (error) {
            // Handle errors using the onError function
            this.onError(`Error: ${error}`);
            this.stop(); // Stop the coroutine on error
        }
    }
}

module.exports = { Coroutine }
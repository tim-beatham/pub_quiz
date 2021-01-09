
const fs = require("fs");
const path = require("path");

/**
 * A asynchronous logger for Node.js
 */
class Logger {
    /**
     * Requires the current directory so we know
     * where to store log files.
     * 
     * @param {string} logDirectory 
     */
    constructor (logDirectory) {
        this.logDirectory = logDirectory;
        this.fileName = "";
        this._createLogFile();
    }

    /**
     * Creates today's log directory
     * if it does not currently exist.
     */
    _createLogFile() {
        // Create the current folder for the current date.
        let dateObj = new Date();
        
        let todaysDate = `${dateObj.getFullYear()}-${("0" + (dateObj.getMonth() + 1)).slice(-2)}-${("0" + dateObj.getDate()).slice(-2)}`;

        if (!fs.existsSync (path.join(this.logDirectory, todaysDate))) {
            fs.mkdirSync(path.join (__dirname, this.logDirectory, todaysDate), {recursive: true});
        }

        let fileName = `${dateObj.getHours()}-${dateObj.getMinutes()}-${dateObj.getSeconds()}.log`

        
        this.fileName = path.join(__dirname, this.logDirectory, todaysDate, fileName);

        // Create the file
        fs.openSync(this.fileName, 'w');
    }

    /**
     * Writes a log to the log file.
     * @param {string} type     the type of the log to append to the file    
     * @param {*} message       the message to add to the log file.
     */
    writeLog(type, message, stdout=true) {
        let dateObj = new Date();
        let toWrite = `[${dateObj.getHours()}-${dateObj.getMinutes()}-${dateObj.getSeconds()}][${type}][${message}]`;

        console.log("file name", this.fileName);

        fs.appendFile(this.fileName, toWrite, (err) => {
            if (err) throw err;
        })

        if (stdout) {
            console.log(toWrite);
        }
    }

    /**
     * Write an INFO log to the log file.
     * @param {string} message 
     */
    writeInfoLog(message, stdout=true) {
        this.writeLog("INFO", message);
    }

    /**
     * Write an error log to the log file.
     * @param {string} message 
     */
    writeErrorLog(message, stdout=true) {
        this.writeLog("ERROR", message);
    }

    /**
     * Write a warn log to the log file.
     * @param {string} message 
     */
    writeWarnLog(message, stdout=true) {
        this.writeLog("WARN", message);
    }
}

exports.Logger = Logger;
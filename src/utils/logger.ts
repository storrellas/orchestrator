import { LoggerInstance, Logger, transports, LoggerOptions } from 'winston';

export { LoggerInstance, Logger, transports, LoggerOptions } from 'winston';

/**
  * Class print filename and line
  */
export class WLogger extends Logger {
  constructor(options? : LoggerOptions) {
    super(options);

    /**
    * Alter logger.* call to print file and line
    */
    var logger_info_old = this.info;
    this.info = function(msg : any) {
      var fileAndLine = this.traceCaller();
      return logger_info_old.call(this, fileAndLine + " - " + msg);
    }
    var logger_error_old = this.error;
    this.error = function(msg : any) {

      var fileAndLine = this.traceCaller();
      return logger_error_old.call(this, fileAndLine + " - " + msg);
    }
    var logger_warn_old = this.warn;
    this.warn = function(msg : any) {
      var fileAndLine = this.traceCaller();
      return logger_warn_old.call(this, fileAndLine + " - " + msg);
    }
    var logger_debug_old = this.debug;
    this.debug = function(msg : any) {
      var fileAndLine = this.traceCaller();
      return logger_debug_old.call(this, fileAndLine + " - " + msg);
    }
  }

  /**
    * examines the call stack and returns a string indicating
    * the file and line number of the n'th previous ancestor call.
    * this works in chrome, and should work in nodejs as well.
    *
    * @param n : int (default: n=1) - the number of calls to trace up the
    *   stack from the current call.  `n=0` gives you your current file/line.
    *  `n=1` gives the file/line that called you.
    */
  private traceCaller(n=1): any {
    if( isNaN(n) || n<0) n=1;
    n+=1;
    var s : any = (new Error()).stack
      , a=s.indexOf('\n',5);
    while(n--) {
      a=s.indexOf('\n',a+1);
      if( a<0 ) { a=s.lastIndexOf('\n',s.length); break;}
    }
    let b : any = s.indexOf('\n',a+1); if( b<0 ) b=s.length;
    a=Math.max(s.lastIndexOf(' ',b), s.lastIndexOf('/',b));
    b=s.lastIndexOf(':',b);
    s=s.substring(a+1,b);
    return s;
  }

}

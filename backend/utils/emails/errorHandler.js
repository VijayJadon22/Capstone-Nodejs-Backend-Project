export class ErrorHandler extends Error {
    constructor(statusCode, error) {
        super(error); // Call the parent class constructor with the error message
        this.statusCode = statusCode; // Add a custom statusCode property to the error instance

        // Capture the stack trace
        // The first argument is the target object (this), 
        // and the second argument specifies the constructor function to remove from the stack trace
        // This helps in providing a cleaner stack trace that starts from the point of error instantiation
        Error.captureStackTrace(this, this.constructor);
    }
};

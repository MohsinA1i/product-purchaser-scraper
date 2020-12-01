interface ErrorArguments {
    code: number,
    message: string
}

class CustomError extends Error {
    public code: number;
    
    constructor(errorArguments: ErrorArguments) {
      super(errorArguments.message);
      this.code = errorArguments.code;
    }
}
export default CustomError;
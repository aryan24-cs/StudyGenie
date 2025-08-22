class ApiError extends Error{
    constructor( statuscode,message = 'failure',error,stack=""){
        super(message)
        this.statuscode = statuscode,
        this.stack = stack,
        this.message = message,
        this.data = null,
        this.error = error
    }
}

export { ApiError }
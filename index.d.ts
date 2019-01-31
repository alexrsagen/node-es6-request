declare module "es6-request" {
    import http = require("http");
    import stream = require("stream");

    interface CustomOptions {
        bodyAsBuffer?: boolean;
        returnBody?: boolean;
    }

    interface Options extends http.ClientRequestArgs {
        custom?: CustomOptions;
    }
    
    type BodyType = string | Buffer;

    class ES6Request {
        req: http.ClientRequest;

        headers(obj: http.OutgoingHttpHeaders): ES6Request;
        header(key: string, value: number | string | string[] | undefined): ES6Request;
        authBasic(username: string, password: string): ES6Request;
        authBearer(bearer: string): ES6Request;
        options(obj: Options): ES6Request;
        option(key: string, value: any): ES6Request;
        query(key: string, value: string): ES6Request;
        query(params: object): ES6Request;
        start(): ES6Request;
        then(onSuccess?: (data: [string | Buffer, http.IncomingMessage]) => any, onFailure?: (err: Error) => any): Promise<any>;
        catch(onFailure?: (err: Error) => any): Promise<any>;
        destroy(error?: Error): ES6Request;
        perform(): Promise<[string | Buffer, http.IncomingMessage]>;
        perform<T extends BodyType>(): Promise<[T, http.IncomingMessage]>;
        on(event: "error", listener: (err: Error) => void): ES6Request;
        on(event: "data", listener: (chunk: Buffer) => void): ES6Request;
        on(event: "progress", listener: (progress: number, current: number, total: number) => void): ES6Request;
        on(event: "end", listener: () => void): ES6Request;
        on(event: "close", listener: () => void): ES6Request;
        write(chunk: string | Buffer, encoding?: string, callback?: Function): ES6Request;
        pipe(dest: stream.Writable, opt?: object): ES6Request;
        send(body: string | Buffer, encoding?: string, callback?: Function): Promise<any>;
        sendForm(form: object): Promise<any>;
        sendMultipart(form: object | null, files: object | null, filesFieldNameFormat?: string, encoding?: string): Promise<any>;
        sendJSON(data?: any): Promise<any>;
    }

    interface CustomError extends Error {
        code: string;
    }

    interface ES6RequestExport {
        put(url: string, options?: Options): ES6Request;
        post(url: string, options?: Options): ES6Request;
        patch(url: string, options?: Options): ES6Request;
        delete(url: string, options?: Options): ES6Request;
        get(url: string, options?: Options): ES6Request;
        head(url: string, options?: Options): ES6Request;
        options(url: string, options?: Options): ES6Request;
        Errors: {
            InvalidProtocolError: CustomError;
            InvalidMethodError: CustomError;
            WriteOnReadOnlyMethodError: CustomError;
        };
    }

    var out: ES6RequestExport;
    export = out;
}

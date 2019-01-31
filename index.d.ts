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

    class ES6Request extends stream.Duplex {
        req: http.ClientRequest;

        headers(obj: http.OutgoingHttpHeaders): this;
        header(key: string, value: number | string | string[] | undefined): this;
        authBasic(username: string, password: string): this;
        authBearer(bearer: string): this;
        options(obj: Options): this;
        option(key: string, value: any): this;
        query(key: string, value: string): this;
        query(params: object): this;
        start(): this;
        then(onSuccess?: (data: [string | Buffer, http.IncomingMessage]) => any, onFailure?: (err: Error) => any): Promise<any>;
        catch(onFailure?: (err: Error) => any): Promise<any>;
        destroy(error?: Error): this;
        perform(): Promise<[string | Buffer, http.IncomingMessage]>;
        perform<T extends BodyType>(): Promise<[T, http.IncomingMessage]>;
        on(event: "error", listener: (err: Error) => void): this;
        on(event: "data", listener: (chunk: Buffer) => void): this;
        on(event: "progress", listener: (progress: number, current: number, total: number) => void): this;
        on(event: "end", listener: () => void): this;
        on(event: "close", listener: () => void): this;
        on(event: string | symbol, listener: (...args: any[]) => void): this;
        pipe(dest: stream.Writable, opt?: object): this;
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

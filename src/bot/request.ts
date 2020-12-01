import { JSDOM, ResourceLoader, VirtualConsole, CookieJar, ConstructorOptions } from 'jsdom';

import regex from './regex';

interface RequestOptions {
    headers?: { [key: string]: string };
    userAgent?: string;
    hostname?: string;
    proxy?: string;
}

export interface DomRequestOptions {
    location?: string;
    url?: string;
    content?: string;
    runScripts?: 'outside-only' | 'dangerously';
}

export interface Response {
    url: string;
    type: string;
    body: any;
}

export default class Request {
    private _options: RequestOptions;
    private _requestDom?: JSDOM;
    private cookieJar: CookieJar;

    constructor(options?: RequestOptions) {
        this._options = {
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:83.0) Gecko/20100101 Firefox/83.0',
        }
        Object.assign(this._options, options);

        this.cookieJar = new CookieJar();
    }

    set userAgent(newUserAgent: string) {
        this._options.userAgent = newUserAgent;
        if (this._requestDom) this._requestDom.window.close();
    }

    set hostname(newHostname: string) {
        this._options.hostname = newHostname;
    }

    set proxy(newProxy: string) {
        this._options.proxy = newProxy;
        if (this._requestDom) this._requestDom.window.close();
    }

    async dom(options: DomRequestOptions) {
        const domOptions: ConstructorOptions = {
            resources: new ResourceLoader({
                proxy: this._options.proxy,
                strictSSL: false,
                userAgent: this._options.userAgent
            }),
            pretendToBeVisual: true,
            cookieJar: this.cookieJar
        };
        domOptions.virtualConsole = new VirtualConsole();
        domOptions.virtualConsole.sendTo(console, { omitJSDOMErrors: false });
        if (options.location) {
            if (options.location.startsWith('/'))
                options.location = `https://${this._options.hostname}${options.location}`;
            domOptions.url = options.location;
            domOptions.referrer = options.location;
        }
        if (options.runScripts) {
            domOptions.runScripts = options.runScripts;
            domOptions.beforeParse = (window) => {
                window.matchMedia = this.matchMediaStub;
            }
        }
        if (options.url) {
            if (options.url.startsWith('/'))
                options.url = `https://${this._options.hostname}${options.url}`;
            return await JSDOM.fromURL(options.url, domOptions);
        }
        return new JSDOM(options.content, domOptions);
    }

    matchMediaStub(): MediaQueryList {
        return {
            media: '',
            matches: false,
            addListener: function () { },
            removeListener: function () { },
            onchange: function () { },
            addEventListener: function () { },
            removeEventListener: function () { },
            dispatchEvent: () => false
        }
    }

    async get(url: string, headers?: { [key: string]: string }) {
        console.log(`GET Request ${url}`);
        const dom = await this.dom({ location: url, runScripts: 'outside-only' });
        if (this._options.headers) Object.assign(headers, this._options.headers);
        const response = <Response>await new Promise((resolve, reject) => {
            dom.window.executed = resolve;
            dom.window.error = reject;
            const script = `const xhr = new XMLHttpRequest();
            xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300)
                    executed({
                        url: xhr.responseURL,
                        type: xhr.responseType,
                        body: xhr.response
                    });
                else error({code: xhr.status, message: xhr.statusText});
            };
            xhr.open('GET', '${url}');
            ${this.setHeaderStatements(headers)}
            xhr.send();`;
            dom.window.eval(script);
        });
        dom.window.close();
        return response;
    }

    async post(url: string, data: string, headers?: { [key: string]: string }) {
        console.log(`POST Request ${url}`);
        console.log(`POST Data ${data}`);
        const dom = await this.dom({ location: url, runScripts: 'outside-only' });
        if (this._options.headers) Object.assign(headers, this._options.headers);
        const response = <Response>await new Promise((resolve, reject) => {
            dom.window.executed = resolve;
            dom.window.error = reject;
            const script = `const xhr = new XMLHttpRequest();
            xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300)
                    executed({
                        url: xhr.responseURL,
                        type: xhr.responseType,
                        body: xhr.response
                    });
                else error({code: xhr.status, message: xhr.statusText});
            };
            xhr.open('POST', '${url}');
            ${this.setHeaderStatements(headers)}
            xhr.send('${data}');`;
            dom.window.eval(script);
        });
        dom.window.close();
        return response;
    }

    setHeaderStatements(headers?: { [key: string]: string }) {
        let setHeaderStatements = '';
        for (const name in headers) setHeaderStatements += `xhr.setRequestHeader('${name}', '${headers[name]}');`
        return setHeaderStatements;
    }

    async submitForm(dom: JSDOM, formSelector: string, setValues: (formValues: { [key: string]: any }) => void, honeypotSelector?: string) {
        const form = <HTMLFormElement>dom.window.document.querySelector(formSelector);
        const fields = form.querySelectorAll('[name]:not([type="submit"])');

        const values: { [key: string]: any } = {};
        for (const field of fields as any) {
            if (honeypotSelector) {
                if (!field.matches(honeypotSelector)) values[field.name] = field.value;
            } else values[field.name] = field.value;
        }
        await setValues(values);

        let data = '';
        for (const field of fields as any) {
            if (honeypotSelector && field.matches(honeypotSelector))
                data += `&${field.name}=`;
            else if (values[field.name]) {
                data += `&${field.name}=${values[field.name]}`;
                delete values[field.name];
            }
        }
        for (const name in values)
            data += `&${name}=${values[name]}`;
        data = encodeURI(data.slice(1));

        dom.window.close();
        const response = await this.post(form.action, data, { 'Content-Type': 'application/x-www-form-urlencoded' });
        return response;
    }
}
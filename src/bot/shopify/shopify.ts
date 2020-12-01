import _ from 'lodash';
import Events from 'events';
const eventEmitter = new Events.EventEmitter();
import StringSimilarity from 'string-similarity';

import CustomError from '../../error';
import { Product, Account, Contact, Card, RecursivePartial } from '../types';
import regex from '../regex';
import Request, { Response } from '../request';
import { JSDOM } from 'jsdom';

interface StoreOptions {
    delay?: number;
    proxy?: string;
    password?: string;
    product: ShopifyProduct;
    account?: Account;
    contact: Contact;
    card: Card;
}

interface ShopifyProduct extends Product {
    handle?: string
}

export default class Shopify {
    private options: StoreOptions;
    private request: Request;

    constructor(options: StoreOptions) {
        if (!options.delay || options.delay < 1000) options.delay = 1000;
        this.request = new Request({
            hostname: regex.getHostname(options.product.url),
            proxy: options.proxy
        });
        options.product.handle = regex.getEndpoint(options.product.url);
        this.options = options;
    }

    setOptions(options: RecursivePartial<StoreOptions>) {
        if (options.delay && options.delay < 1000) options.delay = 1000;
        if (options.proxy) this.request.proxy = options.proxy;
        if (options.password) eventEmitter.emit('password', options.password);
        if (options.product && options.product.url) {
            this.request.hostname = regex.getHostname(options.product.url);
            this.options.product.handle = regex.getEndpoint(options.product.url);
        }
        _.merge(this.options, options);
    }

    locationURL(location: string) {
        if (location == 'contact_information' || location == 'shipping_method' || location == 'payment_method')
            return `\/checkout?step=${location}`
        return '\/' + location; 
    }

    async validateRequest(location: string, result: Response | JSDOM) {
        const url = (result instanceof JSDOM) ? result.window.location.pathname : result.url;
        let endpoint;
        if (location == 'contact_information' || location == 'shipping_method' || location == 'payment_method') {
            const dom = (result instanceof JSDOM) ? result : await this.request.dom({ content: result.body });
            const stepTag = dom.window.document.body.querySelector('[data-step]');
            if (stepTag) endpoint = stepTag.getAttribute('data-step');
            else endpoint = regex.getEndpoint(url);
        } else endpoint = regex.getEndpoint(url);
        if (location != endpoint) {
            let errorCode = 0;
            if (endpoint == 'login') errorCode = 1;
            else if (endpoint == 'checkpoint') errorCode = 2;
            throw new CustomError({ code: errorCode, message: `Expected ${location} redirected to ${endpoint}` });
        }
    }

    async launch() {
        await this.addToCart();
        await this.checkout();
    }

    async onActionRequired(action: string, info?: any) { }

    async addToCart() {
        while (true) {
            try {
                if (this.options.product.handle) {
                    const variant = await this.findVariant(this.options.product.handle, this.options.product.sizes);
                    return await this.submitProduct(this.options.product.handle, variant);
                } else if (this.options.product.keywords) {
                    const product = await this.searchKeywords(this.options.product.keywords);
                    const variant = await this.findVariant(product.handle, this.options.product.sizes);
                    return await this.submitProduct(product.handle, variant);
                }
            } catch (error) {
                console.log(error.message);
                if (error.code == 403) throw new Error(error.message);
                else if (error.code == 401) await this.submitPassword(this.options.password);
                else await new Promise(resolve => setTimeout(resolve, this.options.delay));
            }
        }
    }

    async checkout() {
        let response;
        while (true) {
            try { 
                response = await this.submitContact(this.options.contact);
                break;
            } catch (error) {
                console.log(error.message);
                await new Promise(resolve => setTimeout(resolve, this.options.delay));
            }
        }
        while (true) {
            try { 
                response = await this.submitShipping(response.body);
                break;
            } catch (error) {
                console.log(error.message);
                if (error.code == 3) delete response.body;
                await new Promise(resolve => setTimeout(resolve, this.options.delay));
            }
        }
    }

    async submitPassword(password?: string) {
        if (password) {
            const dom = await this.request.dom({ url: this.locationURL('password') });
            await this.validateRequest('password', dom);
            await this.request.submitForm(dom, '[action="/password"]', (formValues) => formValues.password = password);
        } else {
            const password = <string>await new Promise(resolve => {
                eventEmitter.once('password', (password) => resolve(password));
                this.onActionRequired('password');
            });
            await this.submitPassword(password);
        }
    }

    async searchKeywords(keywords: string) {
        const { body } = await this.request.get(`/search/suggest.json?q=${encodeURI(keywords)}&resources[type]=product&resources[limit]=1&resources[options][unavailable_products]=hide`);
        const product = JSON.parse(body).resources.results.products[0];
        if (product == undefined) throw new CustomError({ code: 0, message: 'Keywords not found' });
        return {
            name: product.title,
            price: product.price,
            image: product.image,
            handle: product.handle
        }
    }

    async findVariant(handle: string, sizes?: string[]) {
        const { body } = await this.request.get(`/products/${handle}.js`);
        let variants = <{ [key: string]: any }[]>JSON.parse(body).variants;
        variants = variants.filter((variant) => variant.available);
        let variant;
        if (sizes) variant = variants.find((variant) => sizes.includes(variant.option1) || sizes.includes(variant.option2) || sizes.includes(variant.option3));
        else variant = variants[0];
        if (variant) return variant;
        else throw new CustomError({ code: 0, message: 'Not available' });
    }

    async submitProduct(handle: string, variant: { [key: string]: any }) {
        const dom = await this.request.dom({ url: this.locationURL(`products/${handle}`) });
        await this.validateRequest(handle, dom);
        return await this.request.submitForm(dom, '[action="/cart/add"]', (formValues) => formValues.id = variant.id);
    }

    async submitContact(contact: Contact) {
        const values: { [key: string]: string } = {
            'checkout[email]': contact.email,
            'checkout[email_or_phone]': contact.email,
            'checkout[shipping_address][first_name]': contact.firstName,
            'checkout[shipping_address][last_name]': contact.lastName,
            'checkout[shipping_address][company]': contact.company,
            'checkout[shipping_address][city]': contact.city,
            'checkout[shipping_address][zip]': contact.zip,
            'checkout[shipping_address][phone]': contact.phone
        }
        const dom = await this.request.dom({ url: this.locationURL('contact_information'), runScripts: 'outside-only' });
        await this.validateRequest('contact_information', dom);
        return await this.request.submitForm(dom, '[data-customer-information-form]', async (formValues) => {
            const secondAddress = dom.window.document.body.querySelector('[name="checkout[shipping_address][address2]"]');
            if (secondAddress) {
                formValues['checkout[shipping_address][address1]'] = contact.address1;
                formValues['checkout[shipping_address][address2]'] = contact.address2;
            } else formValues['checkout[shipping_address][address1]'] = `${contact.address1} ${contact.address2}`;

            const scriptTag = <HTMLScriptElement>dom.window.document.querySelector('script[src*="checkout_countries"]');
            const { body } = await this.request.get(scriptTag.src);
            dom.window.eval(body);

            const country = StringSimilarity.findBestMatch(contact.country, Object.keys(dom.window.Countries)).bestMatch.target;
            formValues['checkout[shipping_address][country]'] = country;

            const state = StringSimilarity.findBestMatch(contact.state, Object.keys(dom.window.Countries[country].provinces)).bestMatch.target;
            const stateCode = dom.window.Countries[country].provinces[state].code;
            formValues['checkout[shipping_address][province]'] = stateCode;

            for (const name in formValues) if (values[name]) formValues[name] = values[name];

            if (formValues['g-recaptcha-response']) { }
        }, '[data-honeypot]');
    }

    async submitShipping(content?: string) {
        const dom = content ? await this.request.dom({ content: content }) : await this.request.dom({ url: this.locationURL('shipping_method') });
        await this.validateRequest('shipping_method', dom);
        return await this.request.submitForm(dom, '[data-shipping-method-form]', (formValues) => {
            if (!formValues['checkout[shipping_rate][id]']) throw new CustomError({ code: 3, message: 'Missing shipping rate'});
        });
    }
}
module.exports = Shopify;
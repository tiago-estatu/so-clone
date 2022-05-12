/**
 * Request param representation
 * @property {String} key the key of the param. Ex ?size <- this is the key=10
 * @property {any} value value of the param
 * @property {String} [name] a custom name to easily indentify the param
 * @property {Function} [formatter] a custom formatter to format the value. Ex. for date values
 */
import {isNotNullOrUndefined} from "codelyzer/util/isNotNullOrUndefined";

export class RequestParamModel {
    value: any;
    name: string;
    key: string;

    /**
     * Updates the value of a RequestParam
     * @param value
     * @return {Void}
     */
    updateValue?(value: any): void {
        this.value = value != null ? value : '';
    }

    /**
     * Formatter function
     * @param value
     * @return {String} the formated value
     */
    formatter?: Function = (value): any => {
        return value;
    };

    /**
     *
     * @param key
     * @param value
     * @param name
     * @param formatter
     */
    constructor(key: string, value: any, name?: string, formatter?: Function) {
        if(key.trim() === '') throw Error('Key cannot be empty');
        this.key = key;
        this.value = isNotNullOrUndefined(value) ? value : '';
        this.name = name || key;
        this.formatter = formatter || this.formatter;
    }

}

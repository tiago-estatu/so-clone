import {UtilsHelper} from "../helpers";
import {RequestParamModel} from "./request-param.model";
import {FormGroup} from "@angular/forms";
import {Subscription} from "rxjs";
import { isNullOrUndefined } from 'util';


/**
 * Implement when using backend pagination
 */
export interface BackendPaging {
    totalItems: Number;
    getPage(pageNumber):void;
}


/**
 * Modelo de filtro com funções para facilitar a vida
 * @property {RequestParamModel[]} params list of parameters in the model
 * @private {UtilsHelper} _utils util helper to do common operations
 *
 * @example
 * let filtro = new QueryFilters([new RequestParamModel('size', 10), new RequestParamModel('page', 1), new RequestParamModel('type', 1)]);
 *
 * filtro.updateParam('size', 20);
 * filtro.removeParam('type')
 *
 * // deve retornar '?size=20&page=1'
 * let queryParam = filtro.criarFiltro();
 * let url = 'www.google.com' + queryParam
 */
export class QueryFilters {

    protected params: RequestParamModel[] = [];
    private _utils = new UtilsHelper();
    private _subscription: Subscription;

    constructor(customParams?: RequestParamModel[], attachGroup?: FormGroup) {
        this.params = customParams || this.params;
        if(attachGroup) this.attachForm(attachGroup);
    }

    get length() {
        return this.params.length
    }

    /**
     * Attaches a formgroup to the filters
     * everytime the formgroup updates values, it will update the params with the same name
     * @param form: FormGroup
     * @return void
     * @example
     * queryFilter: QueryFilter = {..., {name: 'name', value: '', key: 'user'}, {name: 'age', value: 20, 'userAge}}
     * formGroup: FormGroup = {..., name: [], age: []}
     * formGroup.patchValue({name: 'test'});
     * queryFilter.criarFiltro() // returns ?user=test&userAge=20
     * formGroup.patchValue({name: 'teste2', age: 30});
     * queryFilter.criarFiltro() // returns ?user=test2&userAge=30
     */
    attachForm(form: FormGroup) {
        let rawValues = form.getRawValue();
        this.updateParams(this.params.map(param => ({name: param.name, value: rawValues[param.name] != null ? rawValues[param.name] : param.value})));

        this._subscription = form.valueChanges.subscribe(data => {
            this.updateParams(this.params.map(param => ({name: param.name, value: data[param.name] != null ? data[param.name] : param.value})));
        })
    }

    /**
     * Detaches from a formGroup by unsubscribing
     * !Remember, always call this function on destroy if you attached a form
     * @return void;
     */
    dettachForm() {
        if(this._subscription) this._subscription.unsubscribe();
    }

    updateParam(param: string, value: any) {
        let paramToUpdate = this.params
            .filter(_param => _param.name.toLowerCase() === param.toLowerCase())
            .map(itm => itm.updateValue(value));
    }

    updateParams(params: {name: string, value: any}[]) {
        params.forEach(param => this.updateParam(param.name, param.value));
    }



    /**
     * Retrieves the formated param value by the name
     * @param name the name of the param to be retreived
     * @param [format] should the value be formatted
     * @returns {Any} - the value
     * let filtro = new QueryFilters(
     * [
     *      new RequestParamModel('size', 10, null, (val) => {return `formated-${val}`}),
     *      new RequestParamModel('page', 1, null, (val) => {return `formated-${val}`}))
     * ]
     * );
     * ...
     * let formatted = filtro.getParam('size');
     * let unformatted = filtro.getParam('page', false);
     *
     * ...
     * console.log(formatted, 'this will print formatted-10');
     * console.log(unformatted, 'this will print 10')
     */
    getParam(name: string, format?: boolean): any {
        if(format === null || format === undefined) format = true;
        let result = this.params.find(param => [param.name, param.key].map(i => i.toLowerCase()).includes(name.toLowerCase()));

        // if result is truthy return value, else return error
        if(!result) throw new Error('Param not found');
        return format ? result.formatter(result.value) : result.value;

    }

    /**
     * Retorna o filtro em formato de queryParams
     * @example
     * let filtro = new QueryFilters([new RequestParamModel('size', 10), new RequestParamModel('page', 1)]);
     * // deve retornar '?size=10&page=1'
     * let queryParam = filtro.criarFiltro();
     * let url = 'www.google.com' + queryParam
     */
    criarFiltro(): string {
        return this.params.filter(item => Array.isArray(item.value) ? item.value.length : !!item.value).reduce((prev, current, index) => {
            return prev + (`${index === 0 ? '?' : '&'}${current.key}=${encodeURIComponent(current.formatter(current.value))}`)
        }, '');

    }

    /**
     * Returns the raw value as a json object of the fields containing values or not
     */
    get value(): any {
        return this.params.reduce((prev, current) => {
            let base = {};
            base[current.key] = current.formatter(current.value);
            return {...prev, ...base}
        }, {})
    }


    /**
     * Returns the raw value as a json object of the fields containing values
     */
    getRawValue(): any {
        return this.params.reduce((prev, current) => {
            let isEmpty = this._utils.isEmpty(current.value);
            let base = {};
            base[current.key] = isEmpty ? '' : current.formatter(current.value);
            return isEmpty ? prev : {...prev, ...base}
        }, {})
    }

    /**
     * Removes a param from the list
     * @param {String} name the name of the param to be removed
     * @return {Void}
     * @example
     * let filtro = new QueryFilters([new RequestParamModel('size', 10), new RequestParamModel('page', 1)]);
     * filtro.removePram('size');
     */
    removeParam(name: string): void {
        this.params = this.params.filter(param => param.name.toLowerCase() === name)
    }
}

import Swal, { SweetAlertIcon } from "sweetalert2";
import {NewModalComponent} from "../components/new-modal";
import {ComponentFixture} from "@angular/core/testing";

export class TestHelper {

    expect;

    constructor(expect: Function) {
        this.expect = expect
    }

    
    /**
     * @param  {string} title
     * @param  {string} content
     * @param  {string} type
     * @param  {true}} config={compareContent
     */
    expectDialog(title: string, content: string, icon: string, config = {compareContent: true}) {

        let swalTitle = document.querySelector('.swal2-title');
        let swalContent = document.querySelector('.swal2-content');
        let swalType = document.querySelector(`.swal2-${icon}>*`);

        this.expect(swalTitle).toBeTruthy();
        this.expect(swalContent).toBeTruthy();
        this.expect(swalType).toBeTruthy();

        this.expect(swalTitle.textContent).toEqual(title);
        config.compareContent ? this.expect(swalContent.textContent).toEqual(content) : null;
    };

    closeDialog() {
        Swal.close();
    };

    confirmDialog() {
        Swal.clickConfirm();
    }

    cancelDialog() {
        Swal.clickCancel();
    }

    /**
     * Valida as funções de Selecionado em componentes combo
     * @param component
     * @param rawValue - valor cru do recebido
     * @param processed - valor final a ser emitido para o parente
     */
    selecionadoItem(component: any, rawValue: any[], processed: any[], varName: string) {
        this.expect(component[varName]).toEqual(rawValue);
        this.expect(component.selecionados.emit).toHaveBeenCalledTimes(1);
        this.expect(component.selecionados.emit).toHaveBeenCalledWith(processed);
        this.expect(component[varName]).toHaveLength(rawValue.length);
    }

    /**
     * Valida as funções de Selecionado em componentes combo
     * @param component
     * @param rawValue
     * @param processed
     * @param form
     */
    selecionadoFormItem(component: any, rawValue: any[], processed: any[], form: string)  {
        this.expect(component[form].value).toEqual(rawValue);
        this.expect(component.selecionados.emit).toHaveBeenCalledTimes(1);
        this.expect(component.selecionados.emit).toHaveBeenCalledWith(processed);
        this.expect(component[form].value).toHaveLength(rawValue.length);
    }

    limparSelecionados(component: any, varName: string) {
        this.expect(component[varName]).toHaveLength(0);
        this.expect(component.selecionados.emit).toHaveBeenCalledTimes(1);
        this.expect(component.selecionados.emit).toHaveBeenCalledWith([]);

    }
}


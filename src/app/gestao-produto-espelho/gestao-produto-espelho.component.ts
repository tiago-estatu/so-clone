import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import {Produto, ProdutoEspelhoService, HeaderService, fadeInOut, UtilsHelper} from "src/app/commons";
import Swal, { SweetAlertIcon } from "sweetalert2";
import { Subscription } from "rxjs";
import { isNullOrUndefined } from 'util';
import {ProdutoEspelhoModel} from "../commons/models/produto-espelho.model";


@Component({
    selector: 'rd-gestao-produto-espelho',
    templateUrl: './gestao-produto-espelho.component.html',
    styleUrls: ['./gestao-produto-espelho.component.scss'],
    animations: [fadeInOut]

})

export class GestaoProdutoEspelhoComponent implements OnInit, OnDestroy {

    // forms and controls
    produtoEspelhoForm: FormGroup;
    fileControl: FormControl;

    //flags
    componentLoading: boolean = false;

    //subscriptions
    semDemandaSubscription: Subscription;
    novoEspelhoSubscription: Subscription;

    //consts
    LABEL_SEM_DEMANDA = 'sem demanda';
    LABEL_NOVO_ESPELHO = 'novo espelho';

    constructor(protected _headerService: HeaderService, private _fb: FormBuilder, private _produtoEspelhoService: ProdutoEspelhoService) {
    }

    ngOnInit() {
        //forms and layout configuration
        this._headerService.setTitle("Produto espelho");
        this.produtoEspelhoForm = this._fb.group({
            semDemanda: [[], Validators.required],
            espelhoCadastrado: [[]],
            novoEspelho: [[], Validators.required]
        });

        this.fileControl = this._fb.control('');

        //subscriptions setup
        this.semDemandaSubscription = this.produtoEspelhoForm.get('semDemanda').valueChanges.subscribe(data => {
            if (isNullOrUndefined(data) || (Array.isArray(data) && data.length == 0)){ 
                this.produtoEspelhoForm.get('espelhoCadastrado').reset('');
            } else { 
                if(!this.componentLoading) this.selectProduct(data);
            }
        });
        
        this.novoEspelhoSubscription = this.produtoEspelhoForm.get('novoEspelho').valueChanges.subscribe(data => {
            if ((Array.isArray(data) && data.length != 0) && !this.componentLoading) this.selectMirror(data);
        })
    }

    selectMirror(event: Produto[]) {
        this.toggleLoading(true);
        this._produtoEspelhoService.validateMirror(event[0].cdProduto).subscribe(
            data => {},
            (err) => {
                this.produtoEspelhoForm.get('novoEspelho').setValue(null);
                this.showModalProductError(err);
            }
        ).add(() => this.toggleLoading())
    }

    selectProduct(event: Produto[]) {
        this.toggleLoading(true);
        this._produtoEspelhoService.getMirrorByLinkedId(event[0].cdProduto).subscribe(
            data => !!data ? this.patchEspelhoCadastrado(data) : null,
            (err) => err.status !== 404 ?  this.limparEspelhoSemDemanda(err) : null
        ).add(() => this.toggleLoading())
    }
    patchEspelhoCadastrado(data) {
        this.produtoEspelhoForm.patchValue({ espelhoCadastrado: [data] });
    }
    limparEspelhoSemDemanda(err){
        this.produtoEspelhoForm.get('espelhoCadastrado').setValue(null);
        this.produtoEspelhoForm.get('semDemanda').setValue(null);
        this.showModalProductError(err)
    }

    getFormField(control: string): FormControl {
        return this.produtoEspelhoForm.get(control) as FormControl
    }

    salvarFormulario() {
        this.toggleLoading(true);
        let formValues = this.produtoEspelhoForm.getRawValue();
        formValues.semDemanda = formValues.semDemanda[0];
        formValues.novoEspelho = formValues.novoEspelho[0];
        let resultado = new ProdutoEspelhoModel(formValues);
        this._produtoEspelhoService.updateProduct(resultado).subscribe(
            data => {
                const MSG = this.msg(this.produtoEspelhoForm.getRawValue());
                this.showModal(MSG.titulo, MSG.msg, MSG.type);
                this.produtoEspelhoForm.reset();
            },
            err => this.showModal('Não foi possivel salvar alterações', err.error.mensagem || null)
        ).add(() => this.toggleLoading());
    }

    /**
     * Método de criacao da mensagem de sucesso após realizar a alteração ou cadastro do produto espelho
     */
    msg(formValues){
        let contemEspelhoCadastrado = !(formValues.espelhoCadastrado[0] === undefined)
        if(contemEspelhoCadastrado){
            return this.ehEspelhoAlterado();
        }else{
            return this.ehEspelhoSalvo();
        }
    }
    
    ehEspelhoSalvo(){
        return {
            titulo: 'Salvo',
            msg: 'Produto salvo com sucesso',
            type: 'success'
        }
    }

    ehEspelhoAlterado(){
        return {
            titulo: 'Alterado',
            msg: 'Produto Alterado com sucesso',
            type: 'success'
        }
    }

    importFile(event) {
        this.toggleLoading(true);
        let file = event.target.files.item(0);
        this._produtoEspelhoService.importProduct(file).subscribe(data => {})
            .add(() => {
                this.toggleLoading();
                this.fileControl.setValue('');
            })
    }

    toggleLoading(value: boolean = false) {
        this.componentLoading = value;
    }

    showModal(title?: string, content?: string, type?) {

        let options = {
            confirmButtonText: 'Ok, Obrigado',
            customClass: { confirmButton: 'setBackgroundColor' }
        };
        let message = {
            title: title || 'Oops!',
            html: content || 'Não foi possível realizar a ação',
            icon: type || 'warning',
        };

        Swal.fire({ ...options, ...message })

    }
    showModalProductError(err){
        this.showModal(err.status === 400 ? 'Produto inválido' : 'Oops!', err.error.mensagem || 'Tente novamente mais tarde', 'warning');
    }
    exportarModeloCSV() {
        this.toggleLoading(true);
        return this._produtoEspelhoService.exportarModeloCSV().then((resolve) => {
            this.toggleLoading();
            const options = {confirmButtonText: 'Ok, obrigado', customClass: {confirmButton: 'setBackgroundColor'}};
            let msg: { title: string, text: string, icon: SweetAlertIcon } = resolve ?
                {
                    title: 'Download Concluído com sucesso!',
                    text: 'Por favor, verifique seus downloads para abrir o modelo.',
                    icon: 'success'
                } :
                {
                    title: 'Oops!',
                    text: 'Desculpe, mas não conseguimos baixar o modelo de importação, por favor, tente novamente mais tarde.',
                    icon: 'warning'
                };

            Swal.fire({...options, ...msg});
            return resolve
        }).then((resolve) => resolve);
    }


    ngOnDestroy(): void {
        if(this.semDemandaSubscription) this.semDemandaSubscription.unsubscribe();
    }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { HeaderService, fadeInOut, Filial, UtilsHelper, ValidatorHelper } from "src/app/commons";
import Swal, { SweetAlertIcon } from "sweetalert2";
import { Subscription } from "rxjs";
import { isNullOrUndefined } from 'util';
import { LojaEspelhoService } from 'src/app/commons/services/loja-espelho/loja-espelho.service';
import { LojaEspelhoModel, LojaEspelhoPostModel, ValidaLojaModel } from 'src/app/commons/services/loja-espelho/loja-espelho.model';


@Component({
    selector: 'rd-loja-espelho',
    templateUrl: './loja-espelho.component.html',
    styleUrls: ['./loja-espelho.component.scss'],
    animations: [fadeInOut]

})

export class LojaEspelhoComponent implements OnInit, OnDestroy {

    // forms and controls
    lojaEspelhoForm: FormGroup;
    fileControl: FormControl;

    //flags
    componentLoading: boolean = false;
    nenhumaLojaEncontrada: boolean = false;
    //subscriptions
    semDemandaSubscription: Subscription;
    novaLojaSubscription: Subscription;

    //consts
    LABEL_SEM_DEMANDA = 'sem demanda';
    LABEL_NOVO_ESPELHO = 'novo espelho';


    _utils: UtilsHelper = new UtilsHelper();

    constructor(protected _headerService: HeaderService, private _fb: FormBuilder, private _service: LojaEspelhoService) {
    }

    ngOnInit() {
        //forms and layout configuration
        this._headerService.setTitle("Loja Espelho");
        this.fileControl = this._fb.control('');
        this.initLojaEspelhoForm();


        this.subscriptionSemDemanda();

        this.subscriptionNovaLoja();


    }

    // CONFIGURAÇÕES DO MODAL
    showModalConfig(title?: string, msgContent?: string, typeIcon?: any) {
        let options = { confirmButtonText: 'Ok, Obrigado', customClass: { confirmButton: 'setBackgroundColor' } };
        let message = { title: title || 'Oops!', html: msgContent || 'Não foi possível realizar a ação, tente mais tarde', icon: typeIcon || 'warning', };
        Swal.fire({ ...options, ...message })
    }

    subscriptionNovaLoja() {
        this.novaLojaSubscription = this.lojaEspelhoForm.get('novoEspelho').valueChanges.subscribe(data => {
            if (isNullOrUndefined(data) || (Array.isArray(data) && data.length == 0)) {
                this.limparFormNovoEspelho();
            } else {
                if (!this.componentLoading) this.validateNewMirror(data);
            }
        });
    }
    /**Evento em que realizará a validação da filial sem demanda escolhida
     */
    subscriptionSemDemanda() {
        this.semDemandaSubscription = this.lojaEspelhoForm.get('semDemanda').valueChanges.subscribe(data => {
            if (isNullOrUndefined(data) || (Array.isArray(data) && data.length == 0)) {
                this.lojaEspelhoForm.get('espelhoCadastrado').reset('');
            } else {
                if (!this.componentLoading) this.searchMirror(data);
            }
        })
    }

    initLojaEspelhoForm() {
        this.lojaEspelhoForm = this._fb.group({
            semDemanda: [[], Validators.required],
            espelhoCadastrado: [[]],
            novoEspelho: [[], Validators.required],
            dtInauguracao: [{ value: '', disabled: true }],
            cluster: []
        });
    }

    limparFormNovoEspelho() {
        this.lojaEspelhoForm.get('dtInauguracao').reset('');
        this.lojaEspelhoForm.get('cluster').reset('');
    }
    //Sem nenhum dado.
    importFile(event) {
        this.toggleLoading(true);
        let file = event.target.files.item(0);
        this._service.import(file).subscribe(data => {
            this.toggleLoading();

            this.showModalConfig(`${data.type}`, `${data.mensagem}`, 'success');

        }, err => {
            this.handleError(err)
        })
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
    showModalProductError(err) {
        this.showModal(err.status === 400 ? 'Loja inválida' : 'Oops!', err.error.mensagem || 'Tente novamente mais tarde', 'warning');
    }

    resetarCampos() {
        this.lojaEspelhoForm.reset();
    }

    exportarModeloCSV() {
        this.toggleLoading(true);
        return this._service.exportarModeloCSV().then((resolve) => {
            this.toggleLoading();
            const options = { confirmButtonText: 'Ok, obrigado', customClass: { confirmButton: 'setBackgroundColor' } };
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

            Swal.fire({ ...options, ...msg });
            return resolve
        }).then((resolve) => resolve);
    }

    /* validateMirror(cdFilial: Filial[]){
         this.toggleLoading(true);
         this._service.validateSemDemanda(cdFilial[0].cd_filial).subscribe(
                 data => !!data ? this.pathLojaEspelhoCadastrado(data) : null,
                 (err) => err.status !== 404 ?  this.limparEspelhoSemDemanda(err) : null
             ).add(() => this.toggleLoading())
         
     }*/

    limparEspelhoSemDemanda(err) {
        this.lojaEspelhoForm.get('espelhoCadastrado').setValue(null);

        this.lojaEspelhoForm.get('semDemanda').setValue(null);
        this.showModalProductError(err)
    }

    /**consulta filial espelho sem demanda selecionado
     * @param  {Filial[]} responseFilialSemDemanda
     */
    searchMirror(responseFilialSemDemanda: Filial[]) {
        this._service.getMirrorByStoreId(responseFilialSemDemanda[0].cd_filial).subscribe(
            data => {
                this.lojaEspelhoForm.patchValue({ espelhoCadastrado: [data] })
                this.pathSemLojaCadastrado();
            }, err => {
                this.pathSemLojaCadastrado(true);
            }
        ).add(() => this.toggleLoading())

    }

    pathSemLojaCadastrado(type: boolean = false) {
        this.nenhumaLojaEncontrada = type;
    }

    validateNewMirror(filiais: Filial[]) {
        this.toggleLoading(true);
        const cdFilial = filiais[0].cd_filial;
        this._service.validateNovoEspelho(cdFilial).subscribe(data => {
            this.pathInformacoesEspelho(data)
        }, err => {
            err.status !== 404 ? this.limparEspelhoSemDemanda(err) : null;
        }
        ).add(() => this.toggleLoading());

    }
    pathNovoEspelho(filial) {
        this.lojaEspelhoForm.patchValue({ novoEspelho: [filial] })
    }

    pathInformacoesEspelho(data) {
        let dt = '';
        if (data.dtInauguracao.length > 9) {
            dt = data.dtInauguracao.slice(0, -9);
        } else {
            dt = data.dtInauguracao;
        }

        this.lojaEspelhoForm.patchValue({ dtInauguracao: [dt] })
        this.lojaEspelhoForm.patchValue({ cluster: [data.cdCluster + ' - ' + data.dsCluster] })
    }

    getFormField(control: string) {
        return this.lojaEspelhoForm.get(control) as FormControl
    }

    salvarFormulario() {
        let operador = Number(localStorage.getItem('cdOperador'));
        this.toggleLoading(true);
        let formValues = this.lojaEspelhoForm.getRawValue();
        formValues.semDemanda = formValues.semDemanda[0];
        formValues.novoEspelho = formValues.novoEspelho[0];
        if (!this._utils.isEmpty(formValues.espelhoCadastrado)) {
            formValues.espelhoCadastrado = formValues.espelhoCadastrado[0];
        }
        const salvar: LojaEspelhoPostModel = {
            cdFilial: formValues.semDemanda.cd_filial,
            cdFilialEspelho: formValues.novoEspelho.cd_filial,
            cdOperador: operador
        }

        this._service.updateStoreMirror(salvar).subscribe(data => {
            const MSG = this.msg(this.lojaEspelhoForm.getRawValue());
            this.showModal(MSG.titulo, MSG.msg, MSG.type);
            this.lojaEspelhoForm.reset();
        }, err => this.showModal('Não foi possivel salvar alterações', err.error.mensagem || null)
        ).add(() => this.toggleLoading(false));

    }
    /**
     * Método de criacao da mensagem de sucesso após realizar a alteração ou cadastro do produto espelho
     */
    msg(formValues) {
        if (this._utils.isEmpty(formValues.espelhoCadastrado)) {
            return this.ehEspelhoSalvo();
        } else {
            return this.ehEspelhoAlterado();
        }
    }

    ehEspelhoSalvo() {
        return {
            titulo: 'Salvo',
            msg: 'Filial salvo com sucesso',
            type: 'success'
        }
    }

    ehEspelhoAlterado() {
        return {
            titulo: 'Alterado',
            msg: 'Filial Alterado com sucesso',
            type: 'success'
        }
    }

    // TRATAMENTO DE ERROS
    handleError(error: any) {
        this.componentLoading = false
        if (typeof (error) == 'string') error = JSON.parse(error)
        if (error.status === 404) {
            this.showModalConfig('Oops', 'Não encontramos nenhum registro!' || error.error.mensagem, 'warning');
        } else if (error.status === 0 || error.status === 400 || error.status === 403  || error.status === 500 ) {
            this.showModalConfig('¯\\_(ツ)_/¯', `Erro não esperado, Por favor entre em contato com a equipe técnica, Erro: ${error.mensagem || 'sem log de erro'}`, 'warning');
        } else {
            this.showModalConfig('Oops', `Erro: ${error.mensagem || 'sem log de erro'}`, 'warning');
        }
    }

    ngOnDestroy(): void {
    }
}

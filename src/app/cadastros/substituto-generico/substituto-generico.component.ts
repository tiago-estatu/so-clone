import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { HeaderService } from "../../commons/services";
import { BehaviorSubject, EMPTY, Observable, of, Subscription, throwError } from "rxjs";
import { SubstitutoGenericoService } from "../../commons/services/substituto-generico/substituto-generico.service";
import { SubstitutoGenericoModel } from "../../commons/services/substituto-generico/substituto-generico.model";
import { fadeInOut } from "../../commons/const";
import { switchMap, take, tap } from "rxjs/operators";
import { fromPromise } from "rxjs/internal-compatibility";
import Swal, { SweetAlertOptions, SweetAlertResult } from "sweetalert2";
import { HttpErrorResponse } from "@angular/common/http";


@Component({
    selector: 'rd-substituto-generico',
    templateUrl: './substituto-generico.component.html',
    styleUrls: ['./substituto-generico.component.scss'],
    animations: [fadeInOut],

})
export class SubstitutoGenericoComponent implements OnInit, OnDestroy {

    filterForm: FormGroup;
    substitutoForm: FormGroup;
    fileControl: FormControl;


    productSubject: BehaviorSubject<SubstitutoGenericoModel[]>;
    productSubscription: Subscription;
    imProdutos = [];


    emptyCells = {
        composition: 'Sem cadastro'
    };

    // flags
    editing = false;
    componentLoading: boolean = false;

    constructor(
        private _fb: FormBuilder,
        private _headerService: HeaderService,
        private _substitutoGenericoService: SubstitutoGenericoService
    ) {
    }

    ngOnInit() {
        this.productSubject = this._substitutoGenericoService.productsSubject;
        this._headerService.setTitle('Substituto');
        this.initFilterForm();
        this.initSubstituteForm();
        this.fileControl = this._fb.control('');
        this.productSubscription = this.productSubject.subscribe(data => this.toggleLoading())
    }

    // CONFIGURAÇÕES DO MODAL
    showModalConfig(title?: string, msgContent?: string, typeIcon?: any) {
        let options = { confirmButtonText: 'Ok, Obrigado', customClass: { confirmButton: 'setBackgroundColor' } };
        let message = { title: title || 'Oops!', html: msgContent || 'Não foi possível realizar a ação, tente mais tarde', icon: typeIcon || 'warning', };
        Swal.fire({ ...options, ...message })
    }

    initFilterForm() {
        this.filterForm = this._fb.group({
            cdProduto: ['', Validators.required]
        });
    }

    initSubstituteForm() {
        this.substitutoForm = this._fb.group({
            cdProduto: ['', Validators.required],
            prioridade: ['', Validators.compose([
                Validators.required,
                Validators.min(1),
                Validators.max(20)
            ])]
        });

        this.substitutoForm.get('cdProduto').valueChanges.pipe(switchMap((value: any) => {
            let raw = this.substitutoForm.getRawValue();
            return !!raw.cdProduto ? this._substitutoGenericoService.validate(raw.cdProduto[0].cdProduto) : of(false);
        })).subscribe(data => {
        }, err => {
            err.error.title = {
                400: 'Produto inválido',
                404: 'Produto não encontrado',
                500: 'Não foi possível selecionar o produto'
            };
            this._substitutoGenericoService.showError(err);
            this.substitutoForm.get('cdProduto').setValue(null);
        });
    }


    getControl(group: FormGroup, control: string) {
        if (!group) return;
        return group.get(control) as FormControl
    }

    consultar() {
        this.toggleLoading(true);
        let productId = this.filterForm.get('cdProduto').value[0].cdProduto;
        this._substitutoGenericoService.getCurrentSubstituteList(productId.toString()).add(() => {
            this.toggleEddit();
            this.toggleLoading();
        })
    }


    modifyValues(removeProduct: any = false) {
        this.imProdutos = this.editing ? this.imProdutos : this._substitutoGenericoService.utils.removeReferences(this.productSubject.getValue());
        let conf = {
            title: removeProduct ? 'Deseja excluir o produto?' : 'Deseja alterar as prioridades?',
            content: removeProduct ?
                'Apos excluir o produto devera re-cadastrar todas as prioridades e salvar as mudanças'
                :
                'Devera re-cadastrar todas as prioridades e salvar as mudanças'

        };
        this.askToWipe(conf).pipe(take(1), tap((data) => {
            data.value == true ? this.toggleEddit(true) : false;
            let filtered = this._substitutoGenericoService.utils.removeReferences(this.productSubject.getValue())
                .map(product => {
                    product.prioridade = null;
                    return product
                })
                .filter(item => !!removeProduct ? (item.cdProduto != removeProduct.cdProduto) : true);
            if (filtered.length === 0) window.scrollTo({ top: 0, behavior: 'smooth' });
            data.value == true ? this.productSubject.next(filtered) : false
        })).subscribe(data => {
        })
    }

    cancelEditing() {
        this.productSubject.next(this.imProdutos);
        this.toggleEddit()
    }

    saveOrDelete() {
        let rows = this.productSubject.getValue().length;
        rows < 2 && rows < this.imProdutos.length ? this.shouldRemoveGroup() : this.saveChanges();
    }

    shouldRemoveGroup() {
        Swal.fire({
            icon: 'warning',
            title: 'Deseja excluir a chave de substitutos?',
            html: `
            <span>A exclusão acarretará na deleção da chave de substitutos selecionada por não ter mínimo de produtos na chave.</span>
             <br><span>Mínimo de produtos na chave: 2 </span><br>
             <span>Deseja prosseguir?</span>`,
            showCancelButton: true,
            confirmButtonText: 'Sim',
            cancelButtonText: 'Não',
            customClass: { confirmButton: 'setBackgroundColor' },
        }).then((resp) => {
            this.productSubject.next([]);
            resp.value == true ? this.saveChanges() : null;
        })
    }

    saveChanges() {
        if (!!this.productSubject.getValue().find(item => item.prioridade == null)) {
            let err = new HttpErrorResponse({
                status: 400,
                error: {
                    title: { 400: 'Prioridade não informada' },
                    mensagem: 'Todos os campos de prioridade precissam estar completos para salvar.'
                }
            });
            this._substitutoGenericoService.showError(err);
            return false;
        }
        this.toggleLoading(true);
        let fromDelete = this.productSubject.getValue().length < this.imProdutos.length;
        let deleted = this.imProdutos
            .filter(item => !this.productSubject.getValue()
                .find(prod => (prod.cdProduto == item.cdProduto))
            ).map(i => {
                i.flDeletado = 1;
                return i
            });
        this._substitutoGenericoService.update(fromDelete, deleted).subscribe(data => {
            Swal.fire({
                title: 'Alterações salvas',
                html: 'Todas as alterações foram salvas corretamente',
                icon: 'success',
                confirmButtonText: 'Ok, Obrigado',
                customClass: { confirmButton: 'setBackgroundColor' },
                showCancelButton: false,
            });
            this.toggleEddit();
        }, err => {
            err.error.title = {
                404: 'Substituto não encontrado',
                400: 'Substitutos não validos',
                500: 'Não foi possível salvar os substitutos'
            };

            this._substitutoGenericoService.showError(err);
        }).add(() => this.toggleLoading())
    }


    showInsertionError() {
        let stats = this.editing ? 403 : 400;
        let msg = stats == 400 ? 'A quantidade máxima de substitutos por grupo e de 20 itens' : 'Por favor, salve as alterações antes de adicionar um novo substituto';
        let err = new HttpErrorResponse({
            status: stats,
            error: {
                title: { 400: 'Quantidade máxima de substitutos', 403: 'Salve as alterações para continuar' },
                mensagem: msg
            }
        });
        this._substitutoGenericoService.showError(err);
    }

    addSubstitute() {
        let rawForm = this.substitutoForm.getRawValue();
        this.toggleLoading(true);
        this._substitutoGenericoService.create({
            ...rawForm,
            cdProduto: rawForm.cdProduto[0].cdProduto,
            cdGrupoSubstituto: this.productSubject.getValue()[0].cdGrupoSubstituto,
            flDeletado: 0

        }).subscribe(data => {
            this.substitutoForm.reset();
            this.consultar();
        }, err => {
            err.error.title = {
                400: 'Produto inválido',
                404: 'Produto não encontrado',
                500: 'Não foi possivel cadastrar o substituto'
            };
            this._substitutoGenericoService.showError(err)
        }).add(() => this.toggleLoading());


    }


    askToWipe(config: { title: string, content: string }): Observable<SweetAlertResult> {
        let conf: SweetAlertOptions = {
            title: config.title,
            text: config.content,
            icon: 'warning',
            confirmButtonText: 'Sim',
            customClass: { confirmButton: 'setBackgroundColor' },
            showCancelButton: true,
            cancelButtonText: 'Não'
        };
        return this.editing ? of({ value: true }) : fromPromise(Swal.fire(conf))
    }

    resetarCampos() {
        this.editing = false;
        this.productSubject.next([]);
        this.filterForm.reset();
    }

    importFile(event) {
        this.toggleLoading(true);
        let file = event.target.files.item(0);
        this._substitutoGenericoService.importFile(file)
            .subscribe(data => {
                // this.componentLoading = false;
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

    exportarModeloCSV() {
        this.toggleLoading(true);
        this._substitutoGenericoService.exportModel().add(() => this.toggleLoading())
    }

    toggleLoading(setTrue?: boolean) {
        this.componentLoading = setTrue || false;
    }

    toggleEddit(setTrue?: boolean) {
        this.editing = setTrue || false;
    }

    // TRATAMENTO DE ERROS
    handleError(error: any) {
        this.componentLoading = false
        if (typeof (error) == 'string') error = JSON.parse(error)
        if (error.status === 404) {
            this.showModalConfig('Oops', 'Não encontramos nenhum registro!' || error.error.mensagem, 'warning');
        } else if (error.status === 0 || error.status === 400 ||  error.status === 403 || error.status === 500) {
            this.showModalConfig('¯\\_(ツ)_/¯', `Erro não esperado, Por favor entre em contato com a equipe técnica, Erro: ${error.mensagem || 'sem log de erro'}`, 'warning');
        } else {
            this.showModalConfig('Oops', `Erro: ${error.mensagem || 'sem log de erro'}`, 'warning');
        }
    }


    ngOnDestroy(): void {
        this._substitutoGenericoService.productsSubject.next([]);
        if (this.productSubscription) this.productSubscription.unsubscribe();
    }

}

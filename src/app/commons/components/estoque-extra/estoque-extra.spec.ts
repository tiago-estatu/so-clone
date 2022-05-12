import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {RouterModule} from "@angular/router";
import {FormBuilder, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {EstoqueExtraShared, IEstoqueExtraSharedHeaderService} from "./estoque-extra.shared";
import {Observable, of, throwError} from "rxjs";
import {ResponseUpload} from "../../services/classes";
import {UtilsHelper} from "../../helpers";
import {Component, Injectable} from "@angular/core";
import {CommonModule} from "@angular/common";
import {extra, lmpm} from "./estoque-extra.mock";
import {HttpErrorResponse} from "@angular/common/http";
import {TestHelper} from "../../helpers/test.helper";
import {IEstoqueExtraSharedService} from "../../services/estoqueExtra";

@Injectable()
class StudEstoqueExtraService implements IEstoqueExtraSharedService{

    registros: ResponseUpload = {qtTotalRegistros: 10, qtTotalRegistroComErro: 0, qtTotalRegistrosAlterados: 1, qtTotalRegistrosNovos: 9};
    subPath = 'estoqueExtra';

    exportarModeloCSV(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            setTimeout(() => {
                resolve(this.subPath !== 'error')

            }, 200);
        })
    }
    exportarComFalha(response: ResponseUpload): void {

    }
    uploadExcel(raw: FormData): Observable<ResponseUpload> {
        return ['404', '403'].includes(raw.get('cdOperador').toString()) ? throwError(new HttpErrorResponse({status: parseInt(raw.get('cdOperador').toString()), error: {mensagem: 'Erro', ...this.registros}})) : of(this.registros)
    }
    getEstoquePorFiltros(filtro: string): Observable<any> {
        if(this.subPath == 'error') return  throwError({error: {mensagem: 'Error backend'}});
        let response = this.subPath === 'estoqueExtra' ? extra : lmpm;
        response.content = filtro.includes('page=9999') ? [] : response.content;
        return of(response);
    }

}

@Injectable()
class StudHeaderService implements IEstoqueExtraSharedHeaderService{
    setTitle(title: string): void {

    }
}

@Component({
    selector: 'stud-component',
    template: '',
})
class StudComponent extends EstoqueExtraShared {
    constructor(    protected headerService: StudHeaderService,
                    protected estoqueExtraService: StudEstoqueExtraService,
                    protected _utils: UtilsHelper,
                    protected formBuilder: FormBuilder) {
        super();
    }

    setSubPath(path: 'estoqueExtra' | 'estoqueExtra/lmpm' | 'error' ) {
        this.estoqueExtraService.subPath = path
    }

    get studs() {
        return {
            estoqueExtraService: this.estoqueExtraService,
            headerService: this.headerService
        }
    }
}



describe('Estoque extra shared class', () => {
    let component: StudComponent;
    let fixture: ComponentFixture<StudComponent>;
    const testUtils = new TestHelper(expect);



    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterModule.forChild([]), ReactiveFormsModule, FormsModule, CommonModule],
            declarations: [StudComponent],
            providers: [StudEstoqueExtraService, StudHeaderService, UtilsHelper]
        }).compileComponents();
        fixture = TestBed.createComponent(StudComponent);
        component = fixture.componentInstance;
    }));


    it('Should create the component extending the class', () => {
        expect(component).toBeTruthy();

    });
    
    it('Should have a filter object', () => {
        expect(component.filtroBack).toBeTruthy();
        expect(component.filtroBack.getParam('size')).toBeTruthy();
        expect(component.filtroBack.getParam('page')).toBeTruthy();
        expect(component.filtroBack.length).toBeGreaterThanOrEqual(8);
    });

    it('Should create forms', () => {
        expect(component.filterForm).toBeFalsy();
        expect(component.importForm).toBeFalsy();

        component.createForms();
        expect(component.filterForm).toBeTruthy();
        expect(component.importForm).toBeTruthy();
    });

    it('Should call setTitle', () => {
        // Should not throw when calling the function
        // The title change should be tested in Integration or E2E
        expect(() => component.setTitle('New Title')).not.toThrow();
    });

    it('Should have a method to show a warning modal', () => {
        let config = {title: 'Test', content: 'Content'};

        expect(() => StudComponent.showWarning(config.title, config.content)).not.toThrow();

        let swalTitle = document.querySelector('.swal2-title');
        let swalContent = document.querySelector('.swal2-content');
        let swalIcon = document.querySelector('.swal2-warning>.swal2-icon-content');

        expect(swalTitle).toBeTruthy();
        expect(swalContent).toBeTruthy();
        expect(swalIcon).toBeTruthy();

        expect(swalTitle.textContent).toEqual(config.title);
        expect(swalContent.textContent).toEqual(config.content);

    });

    it('Should have a method to show a warning modal witout parameters', () => {
        let config = {title: 'Oops!', content: 'Não foi possível realizar a ação'};

        expect(() => StudComponent.showWarning()).not.toThrow();

        let swalTitle = document.querySelector('.swal2-title');
        let swalContent = document.querySelector('.swal2-content');
        let swalIcon = document.querySelector('.swal2-warning>.swal2-icon-content');

        expect(swalTitle).toBeTruthy();
        expect(swalContent).toBeTruthy();
        expect(swalIcon).toBeTruthy();

        expect(swalTitle.textContent).toEqual(config.title);
        expect(swalContent.textContent).toEqual(config.content);


    });

    describe('Date validations', () => {
        beforeEach(async(() => {
            component.createForms();
        }));

        afterEach(async () => {
            testUtils.closeDialog();
        });

        it('Should prevent empty or null date values', () => {
            component.filtroBack.updateParam('inicio', null);
            let response = component.validarDataInserida();
            expect(response).toEqual(false);


            component.filtroBack.updateParam('fim', '');
            component.filtroBack.updateParam('inicio', new Date());
            response = component.validarDataInserida();
            expect(response).toEqual(false);


            component.filtroBack.updateParam('inicio', new Date());
            component.filtroBack.updateParam('fim', new Date());
            response = component.validarDataInserida();
            expect(response).toEqual(true);

        });

        it('Should validate that the first date is smaller or equal to the final date', () => {
            // ----- Prep -----
            let today = new Date();
            let yesterday = new Date(today);
            let nextWeek = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            nextWeek.setDate(today.getDate() + 7);

            // ----- Cases -----
            // Data incial proxima semana / data final hoje
            component.filterForm.get('dataInicial').setValue(nextWeek);
            let response = component.validarDataInserida();
            expect(response).toEqual(false);


            // Data inicial hoje / data final ontem
            component.filterForm.get('dataInicial').setValue(today);
            component.filterForm.get('dataFinal').setValue(yesterday);
            response = component.validarDataInserida();
            expect(response).toEqual(false);


            // Data inicial hoje / data final proxima semana
            component.filterForm.get('dataInicial').setValue(today);
            component.filterForm.get('dataFinal').setValue(nextWeek);
            response = component.validarDataInserida();
            expect(response).toEqual(true);


            // Data inicial hoje / data final hoje
            component.filterForm.get('dataInicial').setValue(today);
            component.filterForm.get('dataFinal').setValue(today);
            response = component.validarDataInserida();
            expect(response).toEqual(true);

        });

        it('Should only allow up to 45 days of range', () => {
            // ----- Prep -----
            let today = new Date();
            let next50Days = new Date(today);
            let next45Days = new Date(today);
            let next30Days = new Date(today);
            next30Days.setDate(today.getDate() + 30);
            next45Days.setDate(today.getDate() + 45);
            next50Days.setDate(today.getDate() + 50);

            // ----- Cases -----
            // 30 dias de range
            component.filterForm.get('dataInicial').setValue(today);
            component.filterForm.get('dataFinal').setValue(next30Days);
            let response = component.validarDataInserida();
            expect(response).toEqual(true);

            // 45 dias de range
            component.filterForm.get('dataInicial').setValue(today);
            component.filterForm.get('dataFinal').setValue(next45Days);
            response = component.validarDataInserida();
            expect(response).toEqual(true);

            // 50 dias de range
            component.filterForm.get('dataInicial').setValue(today);
            component.filterForm.get('dataFinal').setValue(next50Days);
            response = component.validarDataInserida();
            expect(response).toEqual(false);
        });

    });

    describe('Pesquisa', () => {
        it('Should search using filters', () => {
            component.setSubPath('estoqueExtra/lmpm');
            component.pesquisar();
            expect(component.estoqueExtraRequest).toBeTruthy();
            expect(component.dataSource.length).toEqual(component.filtroBack.getParam('size', false))
        });


        it('Should show an error if no results where found', () => {
            component.setSubPath('estoqueExtra/lmpm');
            component.filtroBack.updateParam('page', 9999);
            component.pesquisar();
            expect(component.estoqueExtraRequest).toBeTruthy();
            expect(component.dataSource.length).toEqual(0);
            testUtils.expectDialog('Ooops!', 'Dado não encontrado!', 'warning');
        });

        it('Should handle backend erros', () => {
            component.setSubPath('error');
            component.pesquisar();
            expect(component.estoqueExtraRequest).toBeTruthy();

            testUtils.expectDialog('Ooops!', 'Error backend', 'warning');
            component.setSubPath('estoqueExtra');

        });

        afterAll(() => {
            testUtils.closeDialog();
        });




    });

    describe('Consulta', () => {
        beforeAll(() => {
            component.setSubPath('estoqueExtra/lmpm');
        });

        it('Should update the filters before searching', () => {
            component.createForms();
            let endDate = new Date();
            endDate.setDate(endDate.getDate() + 5);
            component.filterForm.get('dataFinal').setValue(endDate);

            component.consultar();
            expect(component.filtroBack.getParam('fim', false)).toEqual(endDate);
        });

        it('Should search from page 1 if a true argument is provided', () => {
            component.createForms();
            component.filtroBack.updateParam('page', 5);

            component.consultar(true);
            expect(component.filtroBack.getParam('page', false)).toEqual('1');
        });

        it('Should not search if the filter has invalid values', () => {
            component.createForms();
            component.filterForm.get('dataInicial').setValue(new Date(2020, 1, 1));
            spyOn(component, 'pesquisar');
            component.consultar(true);
            expect(component.pesquisar).toHaveBeenCalledTimes(0);
        });
        afterAll(() => {
            testUtils.closeDialog();
        })
    });

    describe('Pagination', () => {
        it('Should only change the page attribute when calling pagination', () => {
            component.createForms();
            component.filtroBack.updateParam('page', 1);
            component.pesquisar();

            component.getPage(2);
            expect(component.filtroBack.getParam('page')).toEqual(2);

            component.getPage(10);
            expect(component.filtroBack.getParam('page')).toEqual(10);
        });
    });

    it('Should update filters with extra parameters', () => {
        component.createForms();
        let page = 10;
        let size = 50;
        let tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        component.filterForm.get('dataFinal').setValue(tomorrow);

        expect(component.filtroBack.getParam('page')).not.toEqual(page);
        expect(component.filtroBack.getParam('size')).not.toEqual(size);
        expect(component.filtroBack.getParam('fim', false)).not.toEqual(tomorrow);

        component.updateFilters([
            {name: 'page', value: page},
            {name: 'size', value: size},
        ]);
        expect(component.filtroBack.getParam('page')).toEqual(page);
        expect(component.filtroBack.getParam('size')).toEqual(size);
        expect(component.filtroBack.getParam('fim', false)).toEqual(tomorrow);

    });

    it('Should fill filiais selecionadas', () => {
        expect(component._todasFilialSelecionadas.length).toEqual(0);
        component.preencherFiliaisSelecionadas([1,2,3]);
        expect(component._todasFilialSelecionadas.length).toEqual(3);
    });

    it('Should fill produtos selecionados', () => {
        expect(component._todosProdutosSelecioandos.length).toEqual(0);
        component.preencherProdutosSelecionados([1,2,3]);
        expect(component._todosProdutosSelecioandos.length).toEqual(3);
    });

    describe('Helper functions', () => {
        it('Should transform an array into a comma separated string', () => {
            let value = [1,2,3];
            expect(component.toArrayString(value)).toEqual('1,2,3');
        });

        it('Should transform an product array into a comma separated string', () => {
            let value = [{cdProduto: 1, name: 'teste'}, {cdProduto: 5, name: 'teste 2'}];
            expect(component.produtoToCodArray(value)).toEqual('1,5');
        });

        it('Should call the download function on the service', () => {
            let service = component.studs.estoqueExtraService;
            spyOn(service, "exportarComFalha");
            component.downloadResponse( {
                qtTotalRegistroComErro: 0,
                qtTotalRegistros: 5,
                qtTotalRegistrosAlterados: 0,
                qtTotalRegistrosNovos: 5,
                qtdDatasComProdutosJaSuspensos: 0,
                registrosInvalidos: []
            });
            expect(service.exportarComFalha).toHaveBeenCalledTimes(1);
        })
    });

    describe('MsgImportacao options', () => {
        beforeAll(() => {
            testUtils.closeDialog()
        });

        afterEach(() => {
            testUtils.closeDialog()
        });

        it('Should show a warning if there are errors on the file and download the response if chosen to', async () => {
            component.msgImportacao( {
                qtTotalRegistroComErro: 5,
                qtTotalRegistros: 10,
                qtTotalRegistrosAlterados: 0,
                qtTotalRegistrosNovos: 5,
                qtdDatasComProdutosJaSuspensos: 0,
                registrosInvalidos: []
            });

            testUtils.expectDialog('Importação concluída! Mas...', '', 'warning', {compareContent: false});
            let btn: any = document.querySelector('button.swal2-confirm');
            spyOn(component, 'downloadResponse');
            btn.click();
            await fixture.whenStable();
            expect(component.downloadResponse).toHaveBeenCalledTimes(1);

        });

        it('Should show a warning if there are errors on the file and dont download the response if chosen to', async () => {
            component.msgImportacao( {
                qtTotalRegistroComErro: 5,
                qtTotalRegistros: 10,
                qtTotalRegistrosAlterados: 0,
                qtTotalRegistrosNovos: 5,
                qtdDatasComProdutosJaSuspensos: 0,
                registrosInvalidos: []
            });

            testUtils.expectDialog('Importação concluída! Mas...', '', 'warning', {compareContent: false});
            let btn: any = document.querySelector('.swal2-backdrop-show');
            spyOn(component, 'downloadResponse');
            btn.click();
            await fixture.whenStable();
            expect(component.downloadResponse).toHaveBeenCalledTimes(0);

        });

        it('Should show the success if everything is ok', () => {
            component.msgImportacao( {
                qtTotalRegistroComErro: 0,
                qtTotalRegistros: 10,
                qtTotalRegistrosAlterados: 0,
                qtTotalRegistrosNovos: 10,
                qtdDatasComProdutosJaSuspensos: 0,
                registrosInvalidos: []
            });

            testUtils.expectDialog('Cadastradas com Sucesso!', '', 'success', {compareContent: false});
        });


        it('Should show invalid if no argument is provided',  () => {
            component.msgImportacao();
            testUtils.expectDialog('Oops!', 'Por favor, valide o modelo de excel para importar.', 'error');
        });
    });

    describe('MensagemUpload message generator', () => {
        let response: ResponseUpload;
        beforeEach(() => {
            response = {
                qtTotalRegistroComErro: 0,
                qtTotalRegistros: 0,
                qtTotalRegistrosAlterados: 0,
                qtTotalRegistrosNovos: 0,
                qtdDatasComProdutosJaSuspensos: 0,
                registrosInvalidos: []
            };
        });

        it('Should show only newly addded', () => {
            response.qtTotalRegistros = 10;
            response.qtTotalRegistrosNovos = 10;
            let body = StudComponent.mensagemUpload(response);
            let expected = `
                  <table>
                  <tr><td> De <strong>10</strong> registros.</tr></td>
                  <tr><td> Foram realizados <strong>10</strong> novos cadastros.</td></tr>
                  
                  </table>
                `;
            expect(body.trim()).toEqual(expected.trim())
        });

        it('Should show only updated', () => {
            response.qtTotalRegistros = 10;
            response.qtTotalRegistrosAlterados = 10;
            let body = StudComponent.mensagemUpload(response);
            let expected = `
                  <table>
                  <tr><td> De <strong>10</strong> registros.</tr></td>
                  <tr><td> Foram alterados <strong>10</strong> cadastros.</td></tr>
                  
                  </table>
                `;
            expect(body.trim()).toEqual(expected.trim())
        });

        it('Should show only updated', () => {
            response.qtTotalRegistros = 10;
            response.qtTotalRegistrosAlterados = 10;
            let body = StudComponent.mensagemUpload(response);
            let expected = `
                  <table>
                  <tr><td> De <strong>10</strong> registros.</tr></td>
                  <tr><td> Foram alterados <strong>10</strong> cadastros.</td></tr>
                  
                  </table>
                `;
            expect(body.trim()).toEqual(expected.trim())
        });


        it('Should show with errors', () => {
            response.qtTotalRegistros = 10;
            response.qtTotalRegistrosAlterados = 5;
            response.qtTotalRegistroComErro = 5;
            let body = StudComponent.mensagemUpload(response, true);
            let expected = `
                  <table>
                  <tr><td> De <strong>10</strong> registros.</tr></td>
                  <tr><td> Foram alterados <strong>5</strong> cadastros.</td></tr><tr><td> E não conseguimos realizar <strong>5</strong> cadastros.</td></tr>
                  <tr><td>Deseja realizar o download dos erros?</td></tr>
                  </table>
                `;
            expect(body.trim()).toEqual(expected.trim())
        })

        it('Should show only errors', () => {
            response.qtTotalRegistros = 10;
            response.qtTotalRegistrosAlterados = 0;
            response.qtTotalRegistroComErro = 10;
            let body = StudComponent.mensagemUpload(response, true);
            let expected = `
                  <table>
                  <tr><td> De <strong>10</strong> registros.</tr></td>
                  <tr><td> Não conseguimos realizar <strong>10</strong> cadastros.</td></tr>
                  <tr><td>Deseja realizar o download dos erros?</td></tr>
                  </table>
                `;
            expect(body.trim()).toEqual(expected.trim())
        })

    });

    describe('Upload Excel', () => {
        let event;

        beforeEach(() => {
            localStorage.setItem('cdOperador', '123123');
            event = {
                target: {
                    files: {
                        item: (val) => '123123123213'
                    }
                }
            }
        });

        afterEach(() => {
            testUtils.closeDialog();
        });

        it('Should upload an excel and handle the server success response', () => {
            component.createForms();
            component.importForm.get('file').setValue('123456');
            component.importForm.get('cdOperador').setValue('123456');
            component.importarExcel(event);
            fixture.whenStable().then(() => {
                testUtils.expectDialog('Cadastradas com Sucesso!', '', 'success', {compareContent: false});

            })
        });


        it('Should show a custom error for 404 errors', () => {
            component.createForms();
            component.importForm.get('file').setValue('404');
            component.importForm.get('cdOperador').setValue('404');
            component.importarExcel(event);
            fixture.whenStable().then(() => {
                testUtils.expectDialog('Problemas com o serviço de importar!', '', 'warning', {compareContent: false});
            })
        });

        it('Should handle response errors', () => {
            component.createForms();
            component.importForm.get('file').setValue('403');
            component.importForm.get('cdOperador').setValue('403');
            component.importarExcel(event);
            fixture.whenStable().then(() => {
                testUtils.expectDialog('Ooops!', '', 'warning', {compareContent: false});
            })
        });
    });


    describe('Exportar Modelo CSV', () => {
        afterEach(() => {
            testUtils.closeDialog();
        });

        beforeEach(() => {
            component.setSubPath('estoqueExtra/lmpm');

        });

       it('Should show the success message correctly', async () => {
           component.setSubPath('estoqueExtra');
           await component.exportarModeloCSV();
           testUtils.expectDialog('Download Concluído com sucesso!', 'Por favor, verifique seus downloads para abrir o modelo.', 'success');


       });

        it('Should show the error message correctly', async () => {
            component.setSubPath('error');
            await component.exportarModeloCSV();
            testUtils.expectDialog('Oops!', 'Desculpe, mas não conseguimos baixar o modelo de importação, pro favor, tente novamente mais tarde.', 'warning');


        })
    })

});

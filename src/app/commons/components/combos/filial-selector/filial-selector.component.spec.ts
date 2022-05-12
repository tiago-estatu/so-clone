import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {RouterModule} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {TestHelper} from "../../../helpers/test.helper";
import {FilialSelectorComponent} from './filial-selector.component';
import {CUSTOM_ELEMENTS_SCHEMA, Injectable} from "@angular/core";
import {MatAutocompleteModule, MatChipsModule, MatFormFieldModule, MatInputModule} from "@angular/material";
import {HttpClientModule} from "@angular/common/http";
import {FilialService} from "../../../services/filial";
import {CommonsModule} from "../../../commons.module";
import {Filial} from "../../../services/classes";
import {of, throwError} from "rxjs";
import {SimpleNotificationsModule} from "angular2-notifications";
const NOTIFICATION_CONFIG = {
    timeOut: 3000,
    showProgressBar: true,
    pauseOnHover: true,
    clickToClose: false
}
const FILIAL: Filial = {
    nm_fantasia: 'Fantasia 1',
    nm_razao: 'razao',
    nr_cnpj: '11.111.111/0001-11',
    cd_filial: 1
};

const FILIAIS_SERVER: Filial[] = Array(5).fill(0).map((it, idx) => {
    return  {
        nm_fantasia: `Fantasia ${idx}`,
        nm_razao: `razao ${idx}`,
        nr_cnpj: `11.111.111/0001-1${idx}`,
        cd_filial: idx
    }
});

@Injectable()
class StudService {
    getAllFilialByName() {}
}

describe('Filial Combo', () => {
    const testUtils = new TestHelper(expect);
    let component: FilialSelectorComponent;
    let fixture: ComponentFixture<FilialSelectorComponent>;


    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterModule.forChild([]), ReactiveFormsModule, FormsModule, CommonModule,
                MatAutocompleteModule, MatChipsModule, HttpClientModule, SimpleNotificationsModule.forRoot()
            ],
            declarations: [FilialSelectorComponent],
            providers: [
               {provide: FilialService, useClass: StudService},
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(FilialSelectorComponent);
        component = fixture.componentInstance;
    }));


    it('Should create component', () => {
        expect(component).toBeTruthy();
    });

    describe('Mensagem Tooltip', () => {
       it('Deve retornar o nome fantasia da filial', () => {
            let result = component.mensagemTooltip(FILIAL);
            expect(result).toEqual(FILIAL.nm_fantasia);
       })
    });

    describe('Check number', () => {
        it('Deve retornar um booleano dependendo do keycode do eveto de press se o config for so pra numbers', () => {
            component.config.onlyNumber = true;
            let shouldBeTrue = component.checkNumbers({keyCode: 12});
            let shouldBeFalse = component.checkNumbers({keyCode: 69});
            expect(shouldBeTrue).toEqual(true);
            expect(shouldBeFalse).toEqual(false)
        });
        it('Deve retornar sempre true se o config não for exclusivo pra numbers', () => {
            component.config.onlyNumber = false;
            let shouldBeTrue = component.checkNumbers({keyCode: 12});
            let shouldBeAlsoTrue = component.checkNumbers({keyCode: 69});
            expect(shouldBeTrue).toEqual(true);
            expect(shouldBeAlsoTrue).toEqual(true)
        });
    })



    describe('Search Filial', () => {
        describe('Search by name', () => {
            it('Deve salvar a resposta do servidor e chamar recuperarFiltrados', () => {
                let response = of(FILIAIS_SERVER);
                let name = "teste_nome"
                spyOn(component['service'], 'getAllFilialByName').and.returnValue(response);
                spyOn(component, "recuperarFiltrados");
                expect(component.allFilialFound.length).not.toEqual(FILIAIS_SERVER.length);

                component.searchByName(name);
                expect(component["service"].getAllFilialByName).toHaveBeenCalledTimes(1);
                expect(component["service"].getAllFilialByName).toHaveBeenCalledWith(name);
                expect(component.recuperarFiltrados).toHaveBeenCalledTimes(1);
                expect(component.allFilialFound.length).toEqual(FILIAIS_SERVER.length);
            })

            it('Deve parar o loading se o servidor retornar erro', () => {
                let response = throwError({status: 500, error: {}});
                spyOn(component['service'], 'getAllFilialByName').and.returnValue(response);
                component.searchByName('teste');
                expect(component.componentLoading).toEqual(false)
            })
        })


        describe('Search by code', () => {
            it('Deve salvar a resposta do servidor e chamar recuperarFiltrados', () => {
                let response = of(FILIAIS_SERVER);
                let name = "123";
                spyOn(component['service'], 'getFilialByListCode').and.returnValue(response);
                spyOn(component, "recuperarFiltrados");
                expect(component.allFilialFound.length).not.toEqual(FILIAIS_SERVER.length);

                component.searchByCode(name);
                expect(component["service"].getFilialByListCode).toHaveBeenCalledTimes(1);
                expect(component["service"].getFilialByListCode).toHaveBeenCalledWith('123');
                expect(component.recuperarFiltrados).toHaveBeenCalledTimes(1);
                expect(component.allFilialFound.length).toEqual(FILIAIS_SERVER.length);
            });

            it('Deve parar o loading se o servidor retornar erro', () => {
                let response = throwError({status: 500, error: {}});
                spyOn(component['service'], 'getFilialByListCode').and.returnValue(response);
                component.searchByCode('123');
                expect(component.componentLoading).toEqual(false)
            });

            it('Deve informar do erro se o servidor retornar erro 404', () => {
                let response = throwError({status: 404, error: {}});
                spyOn(component, "notificarNaoEncontrado");
                spyOn(component['service'], 'getFilialByListCode').and.returnValue(response);
                component.searchByCode('123');
                expect(component.componentLoading).toEqual(false);
                expect(component.notificarNaoEncontrado).toHaveBeenCalledTimes(1);
                expect(component.notificarNaoEncontrado).toHaveBeenCalledWith(component.filialControl.value);
            })
        })
    })


    describe('Notificações', () => {

        describe('Notificar Não Encontrado', () => {
            it('Deve notificar que o cod da filial informado não foi encontado', () => {
                spyOn(component['_notifications'], 'error');
                component.notificarNaoEncontrado(FILIAL.cd_filial);
                expect(component['_notifications'].error).toHaveBeenCalledTimes(1);
                expect(component['_notifications'].error).toHaveBeenCalledWith('Oops!', `Não encontramos a filial ${FILIAL.cd_filial}.`, NOTIFICATION_CONFIG);
            })
        });

        describe('Notificar Exclusão selecionado', () => {
            it('Deve notificar foi excluida uma filial', () => {
                spyOn(component['_notifications'], 'info');
                component.notificarExclusaoSelecionado(FILIAL);
                expect(component['_notifications'].info).toHaveBeenCalledTimes(1);
                expect(component['_notifications'].info).toHaveBeenCalledWith(`Removido!`, FILIAL.cd_filial + '-' + FILIAL.nm_fantasia, NOTIFICATION_CONFIG);
            });

            it('Deve notificar foi excluida uma filial com um label customizado', () => {
                spyOn(component['_notifications'], 'info');
                let customLabel = 'LABEL';
                component.config.label = customLabel;
                component.notificarExclusaoSelecionado(FILIAL);
                expect(component['_notifications'].info).toHaveBeenCalledTimes(1);
                expect(component['_notifications'].info).toHaveBeenCalledWith(`Removido ${customLabel}!`, FILIAL.cd_filial + '-' + FILIAL.nm_fantasia, NOTIFICATION_CONFIG);
            })
        })

    })

    describe('Obter descrição da filial', () => {
       it('Deve retornar uma descrição formatada da filial informada, sem nome fantasia se o config for multi', () => {
           component.config.multi = true;
           let expectedString = `${FILIAL.cd_filial} `;
           expect(component.getDescriptionFilial(FILIAL)).toEqual(expectedString);
       })

        it('Deve retornar uma descrição formatada da filial informada, com nome fantasia se o config não for multi', () => {
            component.config.multi = false;
            let expectedString = `${FILIAL.cd_filial} - ${FILIAL.nm_fantasia}`;
            expect(component.getDescriptionFilial(FILIAL)).toEqual(expectedString);

        })
    });


    describe('Recuperar filtros', () => {
        it('Deve mapear o valor do formControl filial e mapear com o filterOnValueChange', async () => {
            spyOn((<any>component), 'filterOnValueChange').and.returnValue([FILIAL]);
            expect(component.filtered).toBeUndefined();
            await component.recuperarFiltrados();
            await component.filialControl.setValue([[1]]);
            fixture.detectChanges();
            expect(component['filterOnValueChange']).toHaveBeenCalledTimes(1);
        })
    })

    describe('Filter on value', () => {
        it('Deve filtrar as filiais ja selecionadas e entregar o resultado se receber o valor um argumento nulo', () => {
            component.allFilialFound = FILIAIS_SERVER;
            spyOn((<any>component), 'filterFilial').and.returnValue([]);
            component.chipSelected = FILIAIS_SERVER.slice(0,2);
            let result = component['filterOnValueChange'](FILIAIS_SERVER[FILIAIS_SERVER.length]);
            expect(result).toEqual(FILIAIS_SERVER.slice(2,5))
            expect(component['filterFilial']).toHaveBeenCalledTimes(0);
        })

        it('Deve filtrar as filiais ja selecionadas e retornar o resultado de filterFilial', () => {
            component.allFilialFound = FILIAIS_SERVER;
            spyOn((<any>component), 'filterFilial').and.returnValue([]);
            component.chipSelected = FILIAIS_SERVER.slice(0,2);
            let result = component['filterOnValueChange'](FILIAIS_SERVER[FILIAIS_SERVER.length - 1]);
            expect(result).toEqual([]);
            expect(component['filterFilial']).toHaveBeenCalledTimes(1);
        })


    })


    describe('Selecionar Filial', () => {
        it('Deve salvar no formControl e emitir a filial recebida e setar o form como enabled si o resultado não estiver vazio', () => {
            expect(component.control.value).toBeNull();
            component.chipSelected = [FILIAL];
            spyOn(component.selecionados, 'emit');
            component.selecionarFilial([FILIAL]);
            testUtils.selecionadoFormItem(component, [FILIAL], [FILIAL], 'control');
            fixture.detectChanges();
            expect(component.filialControl.disabled).toEqual(true);

        })

        it('Deve salvar no formControl e emitir a filial recebida e setar o form como disabled si o resultado estiver vazio', () => {
            expect(component.control.value).toBeNull();
            component.chipSelected = [];
            spyOn(component.selecionados, 'emit');
            component.selecionarFilial([]);
            testUtils.selecionadoFormItem(component, [], [], 'control')
            expect(component.filialControl.disabled).toEqual(false);
        })
    })





});

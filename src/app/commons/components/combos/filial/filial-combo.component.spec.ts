import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {RouterModule} from "@angular/router";
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {TestHelper} from "../../../helpers/test.helper";
import {FilialComboComponent, FilialComboConfig} from "./filial-combo.component";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {HttpClientModule} from "@angular/common/http";
import {UtilsHelper} from "../../../helpers";
import {of} from "rxjs";
const FILIAIS = [
    {item_id: 1, txt: 'teste 1'},
    {item_id: 2, txt: 'teste 2'},
    {item_id: 3, txt: 'teste 3'},
];

const FILIAIS_SERVER = [
    {
        cd_filial: 1,
        nm_fantasia: 'teste 1',
        flFaturamento: false
    },
    {
        cd_filial: 1,
        nm_fantasia: 'teste 2',
        flFaturamento: true
    },
];


describe('Filial Combo', () => {
    const testUtils = new TestHelper(expect);
    let component: FilialComboComponent;
    let fixture: ComponentFixture<FilialComboComponent>;


    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterModule.forChild([]), ReactiveFormsModule, FormsModule, CommonModule, HttpClientModule],
            declarations: [FilialComboComponent],
            providers: [UtilsHelper],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
        fixture = TestBed.createComponent(FilialComboComponent);
        component = fixture.componentInstance;
    }));

    describe('init',  () => {
        it('Should create component', () => {
            expect(component).toBeTruthy();
        })

        it('Deve carregar as configurações depois do init', () => {
            spyOn(component, 'carregarSettingsComponent');
            (<any>component.dropdownSettings) = [];
            component.ngAfterViewInit();
            expect(component.carregarSettingsComponent).toHaveBeenCalledTimes(1);
        });

        it('Deve inicializar a configuração e preencher dados no init', () => {
            spyOn(component, 'carregarSettingsComponent');
            spyOn(component, 'preencherFilial');
            component.ngOnInit()
            expect(component.config).toEqual(new FilialComboConfig(true, undefined));
            expect(component.carregarSettingsComponent).toHaveBeenCalledTimes(1);
            expect(component.preencherFilial).toHaveBeenCalledTimes(1);
        })

    });


    describe('Carregar Settings component', () => {
        it('Deve setar o config do dropdown', () => {
            expect(component.dropdownSettings).toEqual({});
            component.carregarSettingsComponent();
            expect(component.dropdownSettings).toEqual(
                {
                    singleSelection: false,
                    idField: "item_id",
                    textField: "item_text",
                    selectAllText: 'Selecionar Todos',
                    unSelectAllText: "Remover Todos",
                    enableCheckAll:  true,
                    searchPlaceholderText: 'Consultar',
                    itemsShowLimit: 2,
                    limitSelection: 998,
                    allowSearchFilter: true,
                    defaultOpen: false
                }
            );
        })
    });

    describe('Limpar selecionados', () => {
        it('Deve limpar todos os campos selecionados', () => {
            component.filialSelecionadoLista = [1,2,3];
            spyOn(component.selecionados, 'emit')
            component.limparSelecionados();
            testUtils.limparSelecionados(component, 'filialSelecionadoLista')
        })
    })


    describe('Selecionar itens', () => {
        it('Deve emitir os itens selecionados e não setar no form quando o config for multi', () => {
            component.control = new FormControl();
            component.filialSelecionadoLista = FILIAIS;
            let processed = FILIAIS.map(itm => itm.item_id);
            spyOn(component.selecionados, 'emit');
            component.selecionado();
            expect(component.control.value).toEqual(null);
            testUtils.selecionadoItem(component, FILIAIS, processed, 'filialSelecionadoLista')
        })

        it('Deve emitir os itens selecionados e setar no form quando o config não for multi', () => {
            component.control = new FormControl();
            component.config.multi = false;
            component.filialSelecionadoLista = FILIAIS;
            let processed = FILIAIS.map(itm => itm.item_id);
            spyOn(component.selecionados, 'emit');
            component.selecionado();
            expect(component.control.value).toEqual(processed);
            testUtils.selecionadoItem(component, FILIAIS, processed, 'filialSelecionadoLista')
        })
    })


    describe('Gerar filtro filial', () => {
        let fillProperly = (camp, base) => {
            let initial = {
                cdsSelecionados: [],
                regSelecionados: [],
                rotasSelecionadas: []
            };
            base = {...initial, ...base};
            component.cdsSelecionados = base.cdsSelecionados;
            component.regSelecionados = base.regSelecionados;
            component.rotasSelecionadas = base.rotasSelecionadas;
           return  camp.gerarFiltroFilial();
        };

        it('Deve retornar o filtro completo como queryParams', () => {
            let base = {cdsSelecionados: [1],regSelecionados: [1],rotasSelecionadas: [1]};
            let result = fillProperly(component, base);
            expect(result).toEqual('cdRegional=1&cdFilialRegiaoMacro=1&cdFilialRota=1')
        });

        it('Deve retornar o filtro somente com o primeiro item como queryParams', () => {
            let base = {cdsSelecionados: [1,2,3]};
            let result = fillProperly(component, base);
            expect(result).toEqual('cdRegional=1,2,3')
        });

        it('Deve retornar o filtro somente com o segundo item como queryParams', () => {
            let base = {regSelecionados: [1,2,3]};
            let result = fillProperly(component, base);
            expect(result).toEqual('cdFilialRegiaoMacro=1,2,3')
        });

        it('Deve retornar o filtro somente com o terceiro item como queryParams', () => {
            let base = {rotasSelecionadas: [1,2,3]};
            let result = fillProperly(component, base);
            expect(result).toEqual('cdFilialRota=1,2,3')
        })
    });

    describe('Preencher filial como dados do serviço', () => {

        it('Deve formatar e salvar a resposta do servidor', () => {
            let response = of(FILIAIS_SERVER);
            let expectedFormat = FILIAIS_SERVER.map(item => {
                return {
                    item_id: item.cd_filial,
                    item_text: `${item.cd_filial} - ${item.nm_fantasia}${!item.flFaturamento ? ' - S/F' : ''}`,
                    isDisabled: !item.flFaturamento
                }
            });
            spyOn(component['_service'], 'getAllFilialByCdRegiao').and.returnValue(response);
            expect(component.dropdownFilialLista).toHaveLength(0);
            component.preencherFilial();

            expect(component['_service'].getAllFilialByCdRegiao).toHaveBeenCalledTimes(1);
            expect(component.dropdownFilialLista).toEqual(expectedFormat)
        })

    })

});

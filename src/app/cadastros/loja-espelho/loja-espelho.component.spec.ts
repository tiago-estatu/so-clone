import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {TestHelper} from "../../commons/helpers/test.helper";
import {Injectable, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule, HttpErrorResponse} from '@angular/common/http';
import { LojaEspelhoComponent } from './loja-espelho.component';
import { HeaderService } from 'src/app/commons/services/header.service';
import { Filial } from 'src/app/commons/services/classes/Filial';
import { MatChipsModule } from '@angular/material';
import { delay } from 'rxjs/operators/delay';
import { of, throwError } from 'rxjs';
import { LojaEspelhoService } from 'src/app/commons/services/loja-espelho/loja-espelho.service';
import { ValidaLojaModel } from 'src/app/commons/services/loja-espelho/loja-espelho.model';


const LOJA_TESTE_SEMDEMANDA: Filial = { cd_filial: 1, nm_fantasia: 'Sem demanda'} ;
const LOJA_TESTE_ESPELHO_NOVO: Filial = { cd_filial: 2, nm_fantasia: 'Espelho Novo'} ;
const LOJA_TESTE_ESPELHO_CADASTRADO: Filial = { cd_filial: 3, nm_fantasia: 'Espelho cadastrado'} ;

const RESPONSE_VALIDATE_SEM_DEMANDA: ValidaLojaModel = { cdFilial: 900, nmFantasia: 'Loja Sem demanda', cdCluster: 1, dsCluster: 'cluster 1', dtInauguracao: '10/10/2010'} ;
const RESPONSE_VALIDATE_NOVO_ESPELHO: ValidaLojaModel = { cdFilial: 1010, nmFantasia: 'Loja novo Espelho', cdCluster: 1, dsCluster: 'cluster 1', dtInauguracao: '10/10/2010'} ;

const FORMULARIO_PREENCHIDO = {
                                semDemanda: [LOJA_TESTE_SEMDEMANDA], 
                                espelhoCadastrado: [LOJA_TESTE_ESPELHO_CADASTRADO], 
                                novoEspelho: [LOJA_TESTE_ESPELHO_NOVO], 
                                dtInauguracao: '20/10/1990', 
                                cluster: {cd_cluster: 1, ds_cluster: 'cluster 1'}
                            };
const FORMULARIO_LIMPO = { semDemanda: [], 
                            espelhoCadastrado: [], 
                            novoEspelho: [], 
                            dtInauguracao: '', 
                            cluster: null
                        };
describe('LojaEspelhoComponent', () => {
    let component: LojaEspelhoComponent;
    let fixture: ComponentFixture<LojaEspelhoComponent>;
    let service: LojaEspelhoService;
    let utils: TestHelper = new TestHelper(expect);

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, FormsModule, HttpClientModule, MatChipsModule],
            declarations: [LojaEspelhoComponent],
            providers: [HeaderService, LojaEspelhoService],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
            service = TestBed.get(LojaEspelhoService);
            fixture = TestBed.createComponent(LojaEspelhoComponent);
            component = fixture.componentInstance;
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
        spyOn(component['_headerService'], 'setTitle');
        spyOn(component, 'initLojaEspelhoForm');
        spyOn(component, 'subscriptionNovaLoja');
        spyOn(component, 'subscriptionSemDemanda');
        expect(component.novaLojaSubscription).not.toBeDefined();
        expect(component.semDemandaSubscription).not.toBeDefined();

          // init
          component.ngOnInit();
          // validate
          expect(component['_headerService'].setTitle).toHaveBeenCalledWith('Loja espelho');
          expect(component.initLojaEspelhoForm).toHaveBeenCalledTimes(1);
          expect(component.subscriptionNovaLoja).toHaveBeenCalledTimes(1);
          expect(component.subscriptionSemDemanda).toHaveBeenCalledTimes(1);
    });

    describe('Formularios', () => {

         it('deve criar o formulario corretamente', () => {
            expect(component.lojaEspelhoForm).not.toBeDefined();
            component.initLojaEspelhoForm();
            expect(component.lojaEspelhoForm).toBeDefined();
            let rawValue = component.lojaEspelhoForm.getRawValue();
            expect(rawValue).toEqual(FORMULARIO_LIMPO)
        });


        it('deve poder ser resetado', () => {
            component.initLojaEspelhoForm();
            component.lojaEspelhoForm.get('semDemanda').setValue(LOJA_TESTE_SEMDEMANDA);
            expect(component.lojaEspelhoForm.getRawValue().semDemanda).toEqual(LOJA_TESTE_SEMDEMANDA);
            component.resetarCampos();
            expect(component.lojaEspelhoForm.getRawValue().semDemanda).toEqual(null);
        })

       
    })

    describe('selecionar loja sem demanda', ( ) => {
        beforeEach(() =>{
           
        })
        afterEach(() => {
            utils.closeDialog();
        });
        it('deve validar loja sem demanda', fakeAsync(() => {
            //prep
            expect(component.componentLoading).toEqual(false);
           
            // TODO add delayed response
            let resposta = of(RESPONSE_VALIDATE_SEM_DEMANDA).pipe(delay(10));
            spyOn(service, 'validateSemDemanda').and.returnValue(resposta);      
            spyOn(component,'pathLojaEspelhoCadastrado');

            component.validateMirror([LOJA_TESTE_SEMDEMANDA]);
            expect(component.componentLoading).toEqual(true);
            tick(11);
            // assertions
            expect(service.validateSemDemanda).toHaveBeenCalledTimes(1);
            
            expect(component.pathLojaEspelhoCadastrado).toHaveBeenCalledTimes(1);
        
            expect(component.componentLoading).toEqual(false);
        }));

        it('deve chamar a funcao limparEspelhoSemDemanda caso de erro na consulta ', fakeAsync( () => {
             //prep
             expect(component.componentLoading).toEqual(false);
             let resposta = throwError({status: 400, error: { mensagem: 'Erro.'}});

             spyOn(service, 'validateSemDemanda').and.returnValue(resposta);      
             spyOn(component,'limparEspelhoSemDemanda');

             component.validateMirror([LOJA_TESTE_SEMDEMANDA]);
             // assertions
             expect(service.validateSemDemanda).toHaveBeenCalledTimes(1);
             
             expect(component.limparEspelhoSemDemanda).toHaveBeenCalledTimes(1);
         
             expect(component.componentLoading).toEqual(false);
        }));
        
        it('deve procurar a filial espelho cadastrada caso loja sem demanda esteja ok', fakeAsync( () =>{
            // TODO add delayed response
            let resposta = of(RESPONSE_VALIDATE_NOVO_ESPELHO).pipe(delay(10));
            spyOn(service, 'validateNovoEspelho').and.returnValue(resposta);      
            spyOn(component,'pathInformacoesEspelho');

            component.validateNewMirror([LOJA_TESTE_SEMDEMANDA]);
            expect(component.componentLoading).toEqual(true);
            tick(11);


            expect(service.validateNovoEspelho).toHaveBeenCalledTimes(1);
            
            expect(component.pathInformacoesEspelho).toHaveBeenCalledTimes(1);
        
            expect(component.componentLoading).toEqual(false);
        }));
        
        
        it('deve chamar a funcao limparEspelhoSemDemanda caso nao contenha espelho cadastrado', fakeAsync( () =>{
             //prep
             expect(component.componentLoading).toEqual(false);
             let resposta = throwError({status: 400, error: { mensagem: 'Erro.'}});

             spyOn(service, 'validateNovoEspelho').and.returnValue(resposta);      
             spyOn(component,'limparEspelhoSemDemanda');

             component.validateNewMirror([LOJA_TESTE_SEMDEMANDA]);
             // assertions
             expect(service.validateNovoEspelho).toHaveBeenCalledTimes(1);
             
             expect(component.limparEspelhoSemDemanda).toHaveBeenCalledTimes(1);
         
             expect(component.componentLoading).toEqual(false);
        }));
        
    });
})
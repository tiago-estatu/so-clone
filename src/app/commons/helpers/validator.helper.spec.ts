import {Component, Injectable, OnInit} from "@angular/core";
import {UfHelper} from "./uf-helper";
import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {RouterModule} from "@angular/router";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {ValidatorHelper} from "./validator.helper";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
    selector: 'stud-component',
    template: '',
})
class StudComponent implements OnInit {
    simpleForm: FormGroup;

    constructor(public validatorHelper: ValidatorHelper, private _fb: FormBuilder) {

    }

    ngOnInit(): void {
        this.simpleForm = this._fb.group({
            name: ['', Validators.required],
            age: [null]
        })
    }

}


describe('Validator Helper', () => {
    let component: StudComponent;
    let fixture: ComponentFixture<StudComponent>;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterModule.forChild([]), ReactiveFormsModule, FormsModule, CommonModule],
            declarations: [StudComponent],
            providers: [ValidatorHelper]
        }).compileComponents();
        fixture = TestBed.createComponent(StudComponent);
        component = fixture.componentInstance;
    }));

    it('Should be injectable into components', () => {
        expect(component).toBeTruthy();
        expect(component.validatorHelper).toBeTruthy();
    });

    describe('Form Group', () => {

        it('Should have a form group, submitted, errorMessage and errorLoaded  properties', () => {
            component.ngOnInit();
            component.validatorHelper.formGroup = component.simpleForm;
            expect(component.validatorHelper.formGroup).toBeDefined();
            expect(component.validatorHelper.submitted).toBeDefined();
            expect(component.validatorHelper.errorLoaded).toBeDefined();
            expect(component.validatorHelper.errorMessage).toBeUndefined();
        });

        describe('IsInvalid function', () => {
            it('Should return true if the formgroup is not valid and is submited', () => {
                component.ngOnInit();
                component.validatorHelper.formGroup = component.simpleForm;
                expect(component.validatorHelper.isInvalid('name')).toBeUndefined();
                component.validatorHelper.submitted = true;
                expect(component.validatorHelper.isInvalid('name')).toBeTruthy();
                component.validatorHelper.formGroup.get('name').setValue('Teste');
                expect(component.validatorHelper.isInvalid('name')).toBeFalsy();
            })
        });

        describe('IsRequired function', () => {

            beforeEach(() => {
                component.ngOnInit();
                component.validatorHelper.formGroup = component.simpleForm;
                component.validatorHelper.submitted = true;
            });

            it('Should return true if the field is required', () => {
                component.validatorHelper.formGroup = component.simpleForm;
                component.validatorHelper.submitted = true;
                component.validatorHelper.formGroup.markAsDirty();
                fixture.detectChanges();

                expect(component.validatorHelper.isRequired('name')).toEqual(true);
            });

        });


    });

    describe('Error function', () => {

        beforeEach(() => {
            component.ngOnInit();
            component.validatorHelper.formGroup = component.simpleForm;
        });

        it('Should set the messsage Acesso negado if status is 403 or undefined', () => {
            let error403 = new HttpErrorResponse({status: 403});
            let errorundef = new HttpErrorResponse({status: undefined});

            expect(component.validatorHelper.errorMessage).not.toEqual('Acesso negado');
            component.validatorHelper.error(error403);
            expect(component.validatorHelper.errorMessage).toEqual('Acesso negado');

        });


        it('Should set the messsage Usuário ou senha inválidos if status is 401', () => {
            let error401 = new HttpErrorResponse({status: 401});
            let errorundef = new HttpErrorResponse({status: undefined});

            expect(component.validatorHelper.errorMessage).not.toEqual('Usuário ou senha inválidos');
            component.validatorHelper.error(error401);
            expect(component.validatorHelper.errorMessage).toEqual('Usuário ou senha inválidos');

        });

        it('Should set the messsage Ocorreu um erro interno if status is not 401, 403 or undefined', () => {
            let error500 = new HttpErrorResponse({status: 500});
            let error418 = new HttpErrorResponse({status: 418});

            expect(component.validatorHelper.errorMessage).not.toEqual('Ocorreu um erro interno');
            component.validatorHelper.error(error500);
            expect(component.validatorHelper.errorMessage).toEqual('Ocorreu um erro interno');

            component.validatorHelper.errorMessage = undefined;
            expect(component.validatorHelper.errorMessage).not.toEqual('Ocorreu um erro interno');
            component.validatorHelper.error(error418);
            expect(component.validatorHelper.errorMessage).toEqual('Ocorreu um erro interno');

        });

    });

    describe('Mascara CPF CNPJ', () => {
        let cases;
        beforeEach(() => {
            cases = {
                fiveDigits: '12345',
                elevenDigits: '12345678910',
                fourteenDigits: '12345678901234',
                moreDigits: '12321413123123213123',
                evenMoreDigits: '0974681292198189783218012'
            }
        });

        it('Should not format if there are less than 9 digits', () => {
            let result = component.validatorHelper.mascaraCpfCnpj(cases.fiveDigits);
            expect(result).toEqual(cases.fiveDigits);
        });

        it('Should not format if there are more than 14 digits', () => {
            let result1 = component.validatorHelper.mascaraCpfCnpj(cases.moreDigits);
            let result2 = component.validatorHelper.mascaraCpfCnpj(cases.evenMoreDigits);
            expect(result1).toEqual(cases.moreDigits);
            expect(result2).toEqual(cases.evenMoreDigits);
        });

        it('Should format 11 digits like CPF', () => {
            let result = component.validatorHelper.mascaraCpfCnpj(cases.elevenDigits);
            expect(result).toEqual('123.456.789-10');
        });

        it('Should format 14 digits like CNPJ', () => {
            let result = component.validatorHelper.mascaraCpfCnpj(cases.fourteenDigits);
            expect(result).toEqual('12.345.678/9012-34');
        });

        it('Should return the same value if undefined', () => {
            let result = component.validatorHelper.mascaraCpfCnpj(undefined);
            expect(result).toEqual(undefined);
        })

    });

    describe('Valida Check function', () => {
        it('Should return 1 if true and 0 if false', () => {
            expect(component.validatorHelper.validaCheck(true)).toEqual(1);
            expect(component.validatorHelper.validaCheck(false)).toEqual(0);
        })
    });

    describe('retiraMascaraCPFCNPJ', () => {
        it('Should strip character from the values', () => {
            let cnpj = '12.345.678/9012-34';
            let cpf = '123.456.789-10';
            expect(component.validatorHelper.retiraMascaraCPFCNPJ(cnpj)).toEqual('12345678901234');
            expect(component.validatorHelper.retiraMascaraCPFCNPJ(cpf)).toEqual('12345678910');
        });

        it('Should return an empty string when no value is passed', () => {
            expect(component.validatorHelper.retiraMascaraCPFCNPJ(undefined)).toEqual('');
            expect(component.validatorHelper.retiraMascaraCPFCNPJ(null)).toEqual('');
        })
    });

    describe('Valida CPF CNPJ', () => {
        it('Should validate CPF values', () => {
            expect(component.validatorHelper.validaCpfCnpj('000.000.000-00', true)).toEqual(false);
            expect(component.validatorHelper.validaCpfCnpj('714.172.490-72', true)).toEqual(true);
            expect(component.validatorHelper.validaCpfCnpj('714.172.490-72', false)).toEqual(true);
        });

        it('Should validate CNPJ values', () => {
            expect(component.validatorHelper.validaCpfCnpj('11.111.111/1111-11', true)).toEqual(false);
            expect(component.validatorHelper.validaCpfCnpj('111.111.111/1111-111', true)).toEqual(false);
            expect(component.validatorHelper.validaCpfCnpj('87.161.028/0001-99', true)).toEqual(true);
            expect(component.validatorHelper.validaCpfCnpj('87.161.028/0001-99', false)).toEqual(true);
        });

        it('Should work with empty strings', () => {
            expect(component.validatorHelper.validaCpfCnpj('', true)).toEqual(false);
            expect(component.validatorHelper.validaCpfCnpj('', false)).toEqual(true);
        });
    });

    describe('identificaCPFCNPJ', () => {
        it('Should work with empty strings', () => {
            expect(component.validatorHelper.identificaCPFCNPJ('', true)).toEqual('CPF/CNPJ É UMA CAMPO OBRIGATÓRIO');
            expect(component.validatorHelper.identificaCPFCNPJ('', false)).toEqual('CPF/CNPJ');
        });

        it('Should return human readable strings for validation', () => {
            expect(component.validatorHelper.identificaCPFCNPJ('714.172.490-72', true))
                .toEqual('CPF VALIDADO');
            expect(component.validatorHelper.identificaCPFCNPJ('000.000.000-00', true))
                .toEqual('CPF INVÁLIDO');
            expect(component.validatorHelper.identificaCPFCNPJ('87.161.028/0001-99', true))
                .toEqual('CNPJ VALIDADO');
            expect(component.validatorHelper.identificaCPFCNPJ('11.111.111/1111-11', true))
                .toEqual('CNPJ INVÁLIDO');
            expect(component.validatorHelper.identificaCPFCNPJ('111.111.111/1111-111', true))
                .toEqual('DOCUMENTO INVÁLIDO');

        })
    });

    describe('Valida CPF', () => {
        it('Should work with any number', () => {
            expect(component.validatorHelper.validaCpf('12345')).toEqual(false);
            expect(component.validatorHelper.validaCpf('12341212333')).toEqual(false);
            expect(component.validatorHelper.validaCpf('94385987765')).toEqual(false);
            expect(component.validatorHelper.validaCpf('54387654323')).toEqual(false);
            expect(component.validatorHelper.validaCpf('76583265422')).toEqual(false);
            expect(component.validatorHelper.validaCpf('75433259821')).toEqual(false);
            expect(component.validatorHelper.validaCpf('08002310001')).toEqual(false);
            expect(component.validatorHelper.validaCpf('00000000001')).toEqual(false);

        })
    });

    describe('Valida CNPJ', () => {
        it('Should work with any number', () => {
            expect(component.validatorHelper.validaCnpj('12345')).toEqual(false);
            expect(component.validatorHelper.validaCnpj('12511312123355')).toEqual(false);
            expect(component.validatorHelper.validaCnpj('98467384743355')).toEqual(false);
            expect(component.validatorHelper.validaCnpj('88541312123355')).toEqual(false);
            expect(component.validatorHelper.validaCnpj('87161028000191')).toEqual(false);
            expect(component.validatorHelper.validaCnpj('00000000000001')).toEqual(false);
        })
    });

    describe('IsEmail function', () => {
        it('Should validate emails', () => {
            expect(component.validatorHelper.IsEmail('notvalidemail', true)).toEqual(false);
            expect(component.validatorHelper.IsEmail('', true)).toEqual(false);
            expect(component.validatorHelper.IsEmail('', false)).toEqual(true);
            expect(component.validatorHelper.IsEmail('test@test.com', true)).toEqual(true);

        })
    });

    describe('ValidaData function', () => {
        it('Should validate a date', () => {
            expect(component.validatorHelper.validaData(new Date())).toEqual(true);
            expect(component.validatorHelper.validaData('2020/01/01')).toEqual(true);
            expect(component.validatorHelper.validaData(undefined)).toEqual(false);
            expect(component.validatorHelper.validaData('novalid')).toEqual(false);
        })
    });

    describe('formataData function', () => {
        it('Should format valid dates correctly', () => {
            let earlyDate = new Date(2020, 0, 1);
            let midDate = new Date(2020, 5, 12);
            let lateDate = new Date(2020, 11, 28);

            expect(component.validatorHelper.formataData(earlyDate)).toEqual('01/01/2020');
            expect(component.validatorHelper.formataData(midDate)).toEqual('12/06/2020');
            expect(component.validatorHelper.formataData(lateDate)).toEqual('28/12/2020');
        });

        it('Should work with empty strings and already formatted strings', () => {
            expect(component.validatorHelper.formataData('')).toEqual('');
            expect(component.validatorHelper.formataData('01/01/2020')).toEqual('01/01/2020');
        });

    });

    describe('FormatDataComBarra YYYY/MM/DD', () => {
        it('Should format data with slashes instead of dashes', () => {
            expect(component.validatorHelper.formataDataComBarra('01-01-2020')).toEqual('2020/01/01');
            expect(component.validatorHelper.formataDataComBarra('05-06-2020')).toEqual('2020/06/05');
            expect(component.validatorHelper.formataDataComBarra('28-12-2020')).toEqual('2020/12/28');
        })
    });

    describe('FormataDataBack and formataDataParaAmericano DD-MM-YYYY', () => {

        it('Should format the date into the backend api format', () => {
            let earlyDate = new Date(2020, 0, 1);
            let midDate = new Date(2020, 5, 12);
            let lateDate = new Date(2020, 11, 28);

            expect(component.validatorHelper.formataDataBack(earlyDate)).toEqual('01-01-2020');
            expect(component.validatorHelper.formataDataBack(midDate)).toEqual('12-06-2020');
            expect(component.validatorHelper.formataDataBack(lateDate)).toEqual('28-12-2020');
            expect(component.validatorHelper.formataDataBack('abc')).toEqual('abc');


            expect(component.validatorHelper.formataDataParaAmericano(earlyDate)).toEqual('2020-01-01');
            expect(component.validatorHelper.formataDataParaAmericano(midDate)).toEqual('2020-06-12');
            expect(component.validatorHelper.formataDataParaAmericano(lateDate)).toEqual('2020-12-28');
            expect(component.validatorHelper.formataDataParaAmericano('10/10/2020')).toEqual('2020-10-10');
        });



    });

    describe('FormataDataApi, formataDataApiInicio and formataDataApiInicio YYYYMMDDhhmmSS ', () => {

        it('Should format the date into the backend api format', () => {
            let earlyDate = new Date(2020, 0, 1);
            let midDate = new Date(2020, 5, 12);
            let lateDate = new Date(2020, 11, 28);

            expect(component.validatorHelper.formataDataApi(earlyDate)).toEqual('20200101000000');
            expect(component.validatorHelper.formataDataApi(midDate)).toEqual('20200612000000');
            expect(component.validatorHelper.formataDataApi(lateDate)).toEqual('20201228000000');
            expect(component.validatorHelper.formataDataApi('01/01/2020')).toEqual('20200101000000');

            expect(component.validatorHelper.formataDataApiInicio(earlyDate)).toEqual('20200101000000');
            expect(component.validatorHelper.formataDataApiInicio(midDate)).toEqual('20200612000000');
            expect(component.validatorHelper.formataDataApiInicio(lateDate)).toEqual('20201228000000');
            expect(component.validatorHelper.formataDataApiInicio('01/01/2020')).toEqual('20200101000000');

            expect(component.validatorHelper.formataDataApiFinal(earlyDate)).toEqual('20200101235959');
            expect(component.validatorHelper.formataDataApiFinal(midDate)).toEqual('20200612235959');
            expect(component.validatorHelper.formataDataApiFinal(lateDate)).toEqual('20201228235959');
            expect(component.validatorHelper.formataDataApiFinal('01/01/2020')).toEqual('20200101235959');

        });

        it('Should format slash formatted into the backend api format', () => {
            let earlyDate = '01/01/2020';
            let midDate = '12/06/2020';
            let lateDate = '28/12/2020';

            expect(component.validatorHelper.formataDataApi(earlyDate)).toEqual('20200101000000');
            expect(component.validatorHelper.formataDataApi(midDate)).toEqual('20200612000000');
            expect(component.validatorHelper.formataDataApi(lateDate)).toEqual('20201228000000');
        });

    });

    describe('FormataDataHora', () => {
        it('Should format the date and hour', () => {
            let earlyDate = new Date(2020, 0, 1, 10, 15);
            let lateDate = new Date(2020, 5, 15, 23, 45, 59);

            expect(component.validatorHelper.formataDataHora(earlyDate)).toEqual('20200101101500');
            expect(component.validatorHelper.formataDataHora(lateDate)).toEqual('20200615234559');
        })
    });

    describe('StringToDate cast a string to a Date object', () => {
        it('Should accept any delimiter', () => {
            let comparedDate = new Date(2020, 1, 1);
            let comparedDate2 = new Date(2020, 5, 24);
            expect(component.validatorHelper.stringToDate('01/02/2020', 'dd/mm/YYYY', '/')).toEqual(comparedDate);
            expect(component.validatorHelper.stringToDate('24-06-2020', 'dd-mm-YYYY', '-')).toEqual(comparedDate2)
        });

        it('Should return the same value if invalid parameters are sent', () => {
            let date = 'c-';
            expect(component.validatorHelper.stringToDate(date, 'dd-mm-YYYY', '/')).toEqual(date);
            expect(component.validatorHelper.stringToDate(1, 'dd-mm-YYYY', '/')).toEqual(1);
        });
    });


});
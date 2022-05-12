import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { Execucao } from './consulta/Execucao';
import { ValidatorHelper } from '../commons/helpers/validator.helper';

const  HTTP_EXECUCAO_INTERFACE = 'http://localhost:7002/v1/execucao';

@Injectable({providedIn: 'root'})
export class ExecucaoService{


    constructor(private httpCliente:HttpClient,private dateFormat:ValidatorHelper){}

    listarExecucaoInterface(dataExecucao : Date) : Observable<Execucao[]> {
             
       return this.httpCliente.get<Execucao[]>(HTTP_EXECUCAO_INTERFACE +"?f=dataRotinaInterface@BD@"+  this.dateFormat.formataDataApi(dataExecucao)+"-"+ this.dateFormat.formataDataApi(dataExecucao)); 
    }
}




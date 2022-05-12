import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { AgendaFaturamentoModel } from '../agendaFaturamento/agendaFaturamento.model';
import { ServicePath } from '../../const/ServicePath';
import { AgendaSuspensaoPost } from '../agendaFaturamento/AgendaSuspensaoPost.model';
import { agendaFaturamentoResponseSuspender } from '../agendaFaturamento/agendaFaturamentoResponseSuspender.model';
import { EstornoFaturamentoModel } from './estornoFaturamento.model';
import { ResponseEstornoFaturamentoModel } from './responseEstornoFaturamento.model';
const EXCEL_EXTENSION = '.csv';


@Injectable({
    providedIn: 'root'
})
export class EstornoAgendaFaturamentoService {

    constructor(
        private _httpClient: HttpClient) { }

    // CONSULTA API PARA RECEBER SITUAÇÃO DE FATURAMENTOS PARA OS (CD'S || FILIAIS || PRODUTOS)
    consultar(parametrosParaConsulta): Observable<AgendaFaturamentoModel[]> {
        // tslint:disable-next-line: max-line-length
        return this._httpClient.get<AgendaFaturamentoModel[]>(ServicePath.HTTP_URL_ESTORNO_AGENDA_FATURAMENTO_CONSULTAR + parametrosParaConsulta);
    }

     // ESTORNO DA SUSPENSAO DA AGENDA FATURAMENTO
     estornarSuspensao(raw: EstornoFaturamentoModel): Observable<ResponseEstornoFaturamentoModel[]> {
        // tslint:disable-next-line: max-line-length
        return this._httpClient.post<ResponseEstornoFaturamentoModel[]>(ServicePath.HTTP_URL_ESTORNO_AGENDA_FATURAMENTO, raw);
    }


    downloadFile(data, excelFileName){
        let blob = new Blob(['\ufeff' + data], { type: 'text/csv;charset=utf-8;' });
        let dwldLink = document.createElement("a");
        let url = URL.createObjectURL(blob);
        let isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
        if (isSafariBrowser) {  //if Safari open in new window to save file with random filename.
          dwldLink.setAttribute("target", "_blank");
        }
        dwldLink.setAttribute("href", url);
        dwldLink.setAttribute("download", excelFileName+EXCEL_EXTENSION);
        dwldLink.style.visibility = "hidden";
        document.body.appendChild(dwldLink);
        dwldLink.click();
        document.body.removeChild(dwldLink);
    }

    handleError(error){
        if (error.status === 404) {
            Swal.fire({
                title: 'Não encontramos nenhum registro!',
                html: 'Por favor, selecione outra combinação de filtro para prosseguir.',
                icon: 'warning',
                confirmButtonText: 'Ok Fechar',
                customClass: {confirmButton: 'setBackgroundColor'}
            });
        } else if (error.status === 0) {
            Swal.fire({
                title: 'Serviço de consulta está fora!',
                html: 'Por favor entre em contato com a equipe técnica.',
                icon: 'warning',
                confirmButtonText: 'Ok Fechar',
                customClass: {confirmButton: 'setBackgroundColor'}
            });
        } else {
            Swal.fire({
                title: 'Erro desconhecido!',
                html: `Log: ${error.error.mensagem}`,
                icon: 'warning',
                confirmButtonText: 'Ok Fechar',
                customClass: {confirmButton: 'setBackgroundColor'}
            });
        }
      }
}

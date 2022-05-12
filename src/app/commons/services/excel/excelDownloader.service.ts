import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { UtilsHelper } from '../../helpers';
import { switchMap, catchError } from 'rxjs/operators'; 
import { Http } from '@angular/http';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { LoadingBarService } from '@ngx-loading-bar/core';

@Injectable({
    providedIn: 'root'
})

export class ExcelDownloaderService {
    constructor(
        private _httpClient: HttpClient,
        private loadingBarService: LoadingBarService,
        private _utils: UtilsHelper) { }

    extrairRelatorioCsv(endpoint: string, params: HttpParams, fileName: string): Observable<any>{
        const teste = Observable.create((observer: any) => {
            this._httpClient.get(endpoint,
                {
                    params: params,
                    responseType: 'blob', observe: 'response',
                }).subscribe(res => {
                    this.downloadCsvFile(res,fileName);
                    observer.next(true);
                    observer.complete();
                }, ex => {
                    observer.error("DEU ERRO");
                    observer.complete();
                    if(ex.status !== 0){
                        this.parseErrorBlob(ex).subscribe({
                            error(err) {
                                Swal.fire({
                                icon: "warning",
                                title: "Opss!",
                                text: err.mensagem,
                                confirmButtonText: "Ok, obrigado.",
                                customClass: {confirmButton: 'setBackgroundColor'}
                                });
                            }
                        });
                    }
                });
          });
        return teste;
    }

    parseErrorBlob(err: HttpErrorResponse): Observable<any> {
        const reader: FileReader = new FileReader();

        const obs = Observable.create((observer: any) => {
          reader.onloadend = (e) => {
            observer.error(JSON.parse(reader.result as string));
            observer.complete();
          }
        });
        reader.readAsText(err.error);
        return obs;
    }

    private downloadCsvFile(response, fileName: string) {
        let dwldLink = document.createElement("a");
        let url = URL.createObjectURL(response.body);
        let isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
        if (isSafariBrowser) {  //if Safari open in new window to save file with random filename.
            dwldLink.setAttribute("target", "_blank");
        }
        dwldLink.setAttribute("href", url);
        dwldLink.setAttribute("download", fileName + ".csv");
        dwldLink.style.visibility = "hidden";
        document.body.appendChild(dwldLink);
        dwldLink.click();

        setTimeout(() => Swal.fire({
            icon: "success",
            title: "Relatório exportado com sucesso!",
            text: 'Relatório pronto para salvar.',
            confirmButtonText: "Ok, obrigado.",
            customClass: {confirmButton: 'setBackgroundColor'}
         }), 2000);
        document.body.removeChild(dwldLink);
    }
}
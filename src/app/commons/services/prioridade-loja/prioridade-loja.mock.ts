import {Observable, of, Subscription, throwError} from 'rxjs';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpRequest} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {QueryFilters} from '../../models/query-param.model';
import {delay, tap} from 'rxjs/operators';
import {fromPromise} from 'rxjs-compat/observable/fromPromise';
import {UploadHelper} from '../../helpers/upload.helper';
import {Produto, ResponseUpload} from '../classes';
import {UtilsHelper} from '../../helpers';



export class RequestModel {
    body?: any;
    queryParams?: QueryFilters;
    params?: string[];
    customHeaders?: HttpHeaders;
    endpoint: string;
}


export class PrioridadeLojaMock {
    baseDelay = 800;
    utils = new UtilsHelper();

    constructor(
        private http: HttpClient
        ) {}

    uploader: UploadHelper = new UploadHelper({
        fileName: 'PRIORIDADE_LOJA_',
        format: '.csv',
        columns: ['Prioridade']
    });

    importFile(request: RequestModel): Observable<any> {
        const httpHeader: HttpHeaders = new HttpHeaders().set('Accept', 'application/json');
        return this.http.post<ResponseUpload>(
            request.endpoint,
            request.body,
            {headers: httpHeader}
        ).pipe(tap(data => {this.uploader.importFileHandler(data)}, err => {this.uploader.importError(err)}))
    }


}

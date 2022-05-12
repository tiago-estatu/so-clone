import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IReserve } from 'src/app/cadastros/cadastro-trava-estoque/trava-estoque';
import Swal from 'sweetalert2';
import { ResponseUpload } from '..';
import { ServicePath } from '../../const';
import { UploadHelper } from '../../helpers/upload.helper';
import { QueryFilters } from '../../models/query-param.model';
import { LoadingService } from '../loading';
import { ValidatorHelper } from '../../helpers';


@Injectable({ providedIn: 'root' })
export class TravaEstoqueService {
    $reserves = new BehaviorSubject<IReserve[]>([]);
    $paging = new BehaviorSubject<{ totalElements: number }>({ totalElements: 0 })
    upload: UploadHelper = new UploadHelper({
        fileName: 'TRAVA_ESTOQUE_',
        format: 'csv',
        columns: ['COD CD', 'PRODUTO', 'QUANTIDADE', 'DATA FIM', 'MOTIVO']
    });

    constructor(
        private _http: HttpClient,
        private _loader: LoadingService,
        private _validator: ValidatorHelper
    ) {

    }

    getMotives() {
        this._loader.carregar()
        return this._http.get<any[]>(ServicePath.HTTP_TRAVA_ESTOQUE + '/motivos').pipe(
            tap(
                data => this._loader.parar(),
                err => {
                    this.showSwal('Ops!', err.error && err.error.message ? err.error.message : 'Não foi possível obter os motivos das travas de estoque. Verifique a sua conexão e tente novamente.', 'error')
                    this._loader.parar()
                }
            )
        )
    }

    // BUSCAR TRAVAS (RETURNO OBSERVABLE)
    buscarTravasCadastradas(parametrers: QueryFilters): Observable<any> {
        this._loader.carregar()
        return this._http.get<{ totalElements: number }>(ServicePath.HTTP_TRAVA_ESTOQUE + parametrers.criarFiltro()).pipe(
            tap(
                data => {
                    this._loader.parar();
                    this.$paging = data.totalElements;
                }, err => {
                    this._loader.parar()
                    this.showSwal('Ops!', err.error && err.error.erro.message ? err.error.erro.message : 'Não foi possível obter as travas de estoque. Verifique a sua conexão e tente novamente.', 'error')
                }
            )
        )
    }

    // BUSCAR TRAVAS (BehaviorSubject)
    getReserves(parametrers: QueryFilters) {
        this._loader.carregar()
        this._http.get<{ content: IReserve[], pageable: { page: number, numberOfItems: number } }>(ServicePath.HTTP_TRAVA_ESTOQUE + parametrers.criarFiltro()).subscribe(data => {
            this.$reserves.next(data.content.map(e => ({ ...e, dtReserva: new Date(e.dtReserva), dataFinal: new Date(e.dataFinal) })));
            //this.$paging.next(data.pageable);
            this._loader.parar()
        }, err => {
            this.showSwal('Ops!', err.error && err.error.erro.message ? err.error.erro.message : 'Não foi possível obter as travas de estoque. Verifique a sua conexão e tente novamente.', 'error')
            this._loader.parar()
        })
    }


    deleteReserve(reserveId: Number, parametrers: QueryFilters) {
        this._loader.carregar()
        let cdOperador = localStorage.getItem('cdOperador');
        return this._http.delete(ServicePath.HTTP_TRAVA_ESTOQUE + `?cdOperador=${cdOperador}&id=${reserveId}`);
    }

    updateReserve(reserve: IReserve): Observable<IReserve> {
        this._loader.carregar()
        let dtFimReservaFormatada = this._validator.formataData(reserve.dtFimReserva);
        let objReserve = { cdProduto: reserve.cdProduto, cdRegional: reserve.cdRegional, dtFimReserva: dtFimReservaFormatada }
        let cdOperador = localStorage.getItem('cdOperador');
        return this._http.put<IReserve>(ServicePath.HTTP_TRAVA_ESTOQUE + `?cdOperador=${cdOperador}`, objReserve).pipe(
            tap(data => {
                this._loader.parar()
                this.showSwal('Sucesso', 'Trava de estoque alterada com sucesso', 'success')
            }, err => {
                this._loader.parar()
                this.showSwal('Ops!', err.error && err.error.erro.message ? err.error.erro.message : 'Não foi possível alterar trava de estoque. Verifique a sua conexão e tente novamente.', 'error')
            })
        )
    }

    downloadCSVCadastro() {
        this._loader.carregar()
        let excelName = this.upload.fileConfig.fileName + 'template_cadastro';
        const httpOptions = {
            headers: new HttpHeaders({
                'Accept': 'text/plain, */*',
                'Content-Type': 'application/json'
            }),
            responseType: 'text' as 'json'
        };
        this._http.get<String>(ServicePath.HTTP_TRAVA_ESTOQUE + '/export/template', httpOptions).subscribe(data => {
            this.upload.downloadFile(data, excelName)
            this._loader.parar()
        }, err => {
            this.showSwal('Ops!', err.error && err.error.erro.message ? err.error.erro.message : 'Não foi possivel obter o template CSV. Verifique a sua conexão e tente novamente.', 'error')
            this._loader.parar()
        })
    }

    downloadCSVDelete() {
        this._loader.carregar()
        let excelName = this.upload.fileConfig.fileName + ' template_exclusão';
        const httpOptions = {
            headers: new HttpHeaders({
                'Accept': 'text/plain, */*',
                'Content-Type' : 'multipart/form-data'
            }),
            responseType: 'text' as 'json'
        };
        this._http.get<String>(ServicePath.HTTP_TRAVA_ESTOQUE + '/export/template/delete', httpOptions).subscribe(data => {
            this.upload.downloadFile(data, excelName)
            this._loader.parar()
        }
        , err => {
            this.showSwal('Ops!', err.error && err.error.erro.message ? err.error.erro.message : 'Não foi possivel obter o template CSV. Verifique a sua conexão e tente novamente.', 'error')
            this._loader.parar()
        })
    } 

    importFile(fileData) {
        this._loader.carregar()
        let raw: FormData = new FormData();
        raw.append("file", fileData || '');
        raw.append('cdOperador', localStorage.getItem('cdOperador'));
        const httpHeader: HttpHeaders = new HttpHeaders().set('Accept', 'application/json');
        return this._http.post<ResponseUpload>(
            ServicePath.HTTP_TRAVA_ESTOQUE + '/upload', raw, { headers: httpHeader }
        ).subscribe(data => {
            //MODAL INFORMATIVO DE PROCESSAMENTO 
            this.showSwal('Sucesso!', data.mensagem, 'success');
            this._loader.parar();
        }, err => {
            this.showSwal('Ops!', err.error.mensagem ? err.error.mensagem : 'Não foi possivel obter o template CSV. Verifique a sua conexão e tente novamente.', 'error');
            this._loader.parar();
        });
    }

    importDelete(fileData) {
        this._loader.carregar()
        let raw: FormData = new FormData();
        raw.append('file', fileData || '');
        raw.append('cdOperador', localStorage.getItem('cdOperador'));
        const httpHeader: HttpHeaders = new HttpHeaders().set('Acept', 'applicationa/json');
        return this._http.post<ResponseUpload>(
            ServicePath.HTTP_TRAVA_ESTOQUE +'/upload/delete', raw, { headers: httpHeader }
        ).subscribe(data => {
            this.showSwal('Sucesso', data.mensagem, 'success');
            this._loader.parar();
        }, err => {
            this.showSwal('Ops', err.error.mensagem ? err.error.mensagem : 'Não foi possivel obter o template CSV.', 'error');
            this._loader.parar();
        })
        
    }

    exportarRelatorio(params: QueryFilters) {
        this._loader.carregar();
        this._http.get<{ mensagem: string, detail: string }>(ServicePath.HTTP_TRAVA_ESTOQUE + '/relatorio' + params.criarFiltro())
            .subscribe(data => {
                this.showSwal('Sucesso!', data.mensagem, 'success');
            }, err => {
                this.showSwal('Ops!', err.error && err.error.erro.message ? err.error.erro.message : 'Não foi possivel fazer upload do arquivo. Verifique a sua conexão e tente novamente.', 'error')
            }).add(() => this._loader.parar())
    }

    showSwal(title: string, text: any, icone: any) {
        Swal.fire({ title: title, text: text, icon: icone, confirmButtonText: 'Ok Fechar', customClass: { confirmButton: 'setBackgroundColor' } })
    }
}
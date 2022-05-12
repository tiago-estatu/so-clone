import { Injectable, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import { ServicePath } from '../../const';
import { BehaviorSubject, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { LoadingService } from '../loading';
import { tap } from 'rxjs/operators';
import { QueryFilters } from '../../models/query-param.model';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { UploadHelper } from '../../helpers/upload.helper';

export class PerfilAcessoModel{
  idPerfil: number;
  dsPerfil: string;
  cdPerfilTipo: number;
  
  constructor( idPerfil: number,  dsPerfil: string, cdPerfilTipo: number) {
    this.idPerfil = idPerfil;
    this.dsPerfil = dsPerfil;
    this.cdPerfilTipo = cdPerfilTipo;
  }
}

@Injectable({providedIn: 'root'})
export class PerfilAcessoService {
  upload: UploadHelper = new UploadHelper({
    fileName: 'relatorio_gestao_acessos',
    format: 'csv',
    columns: ['PERFIL ATRELADO', 'MATRICULA', 'NOME OPERADOR', 'DT ADMISSAO', 'VIGENCIA INICIAL', 'VIGENCIA FINAL', 'STATUS', 'DATA DE ALTERACAO', 'LOG']
});

  constructor(private _http: HttpClient, private _loadService: LoadingService) { }
  dataSource: BehaviorSubject<PerfilAcessoModel[]> = new BehaviorSubject([]);
  $selecionado: BehaviorSubject<number[]> = new BehaviorSubject([]);

  getAllPerfilAcesso(): Observable<PerfilAcessoModel[]> {
    return this._http.get<PerfilAcessoModel[]>(ServicePath.HTTP_URL_LISTAR_PERFIL_ACESSO).pipe(
      tap(response => {
        this.dataSource.next(response);
    }, (error) => {
      this.reset();
    }));
  }

  /*exportarRelatorio(params: QueryFilters) {
    this._loadService.carregar();
    this._http.get<{ mensagem: string, detail: string }>(ServicePath.HTTP_URL_CONSULTA_OPERADOR + '/relatorio' + params.criarFiltro())
    .toPromise()
    .then(res => {
      this._loadService.parar();
      console.log('res', res);
      if (!!res) {
        this.upload.downloadFile(res, this.upload.fileConfig.fileName);
        return res;
      }else {
        throw new Error('arquivo invalido')
      
      }
    })
    .catch((ex) => {
      if (typeof(ex.error) == 'string') ex.error = JSON.parse(ex.error)

      let options: SweetAlertOptions = {
        title: 'Oops',
        html: 'Não foi possivel realizar o download do template. Tente novamente mais tarde.',
        icon: 'warning',
        confirmButtonText: 'Ok Fechar',
        customClass: {confirmButton: 'setBackgroundColor'}
      };
      Swal.fire(options);
      this._loadService.parar();
      return ex;
    });
  }*/
  exportarRelatorio(params: QueryFilters) {
  
    this._http.get(ServicePath.HTTP_URL_CONSULTA_OPERADOR + '/relatorio' + params.criarFiltro(), { responseType: 'text'})
        .subscribe(data => {
          this.upload.downloadFile(data, this.upload.fileConfig.fileName);
            this.showSwal('Sucesso!', "Relatório exportado com sucesso!", 'success');
        }, err => {
          let error = JSON.parse(err.error);
            this.showSwal('Ops!', error.mensagem && error.erro.message ? error.erro.message : 'Não foi possivel fazer upload do arquivo. Verifique a sua conexão e tente novamente.', 'error')
        }).add()
}

  showSwal(title: string, text: any, icone: any) {
    Swal.fire({ title: title, text: text, icon: icone, confirmButtonText: 'Ok Fechar', customClass: { confirmButton: 'setBackgroundColor' } })
  }
  reset(){
    this.$selecionado.next([]);
  }
  
  get selecionados(){
    return this.$selecionado.value;
  }
}

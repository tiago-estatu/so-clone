import { Component, OnInit, ViewChild } from '@angular/core';
import 'rxjs/add/operator/toPromise';
import { saveAs } from 'file-saver/src/FileSaver';
import { NewModalComponent } from '../new-modal';
import { ServicePath, fadeInOut } from '../../const';
import { HeaderService } from '../../services/header.service';
import { AuthenticationService } from '../../services/authentication.service';
import { APIService } from '../../services/api.service';

@Component({
  selector: 'rd-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [fadeInOut]
})

export class HeaderComponent implements OnInit {
  title;
  operador;
  loaded = true;
  showNumberNotification = false;
  numberNotification = 0;
  reports = [];
  componentLoading = false;
  mensagemModal;
  tituloModal; imagemModal;

  @ViewChild(NewModalComponent) modalChild: NewModalComponent;

  constructor(
    private headerService: HeaderService,
    private authenticationService: AuthenticationService,
    private apiService: APIService
  ) { }

  destroyList;

  ngOnInit() {
    this.headerService.title.subscribe(title => {
      this.title = title;
    });

    this.operador = localStorage.getItem('nomeOperador');

     //this.findAllReports();
     //this.destroyList = window.setInterval(this.findAllReports.bind(this), 10000);
  }

  logoutSubmit() {
    this.authenticationService.logout();
  }

  ngOnDestroy(): void {
    window.clearInterval(this.destroyList);
  }


  public downloadReport(report: any) {

    var url = ServicePath.HTTP_DOWNLOAD_RELATORIOS + report.idRelatorio;

    this.apiService.downloadFile(url).subscribe(response => {
      this.findAllReports();
      this.saveToFileSystem(response);
    }, ex => {
      const reader = new FileReader();

      reader.addEventListener('loadend', (e: any) => {
        const text = e.srcElement.result;
        this.findAllReports();
        this.imagemModal = 'times-circle';
        this.mensagemModal = JSON.parse(text).mensagem;
        this.tituloModal = 'Erro!'
        this.modalChild.openModal = true;
      });

      reader.readAsText(ex.blob());
    })

  }
  

  private saveToFileSystem(response) {
    const contentDispositionHeader: string = response.headers.get('Content-Disposition');
    const parts: string[] = contentDispositionHeader.split(';');
    const filename = parts[1].split('=')[1];
    const blob = new Blob([response._body], { type: 'application/x-xls' });
    saveAs(blob, filename);
  }

  public findAllReports() {
    
    let ped  = localStorage.getItem("relatorioPedido") == undefined;
    let not  = localStorage.getItem("relatorioNota") == undefined;
    let iped = localStorage.getItem("relatorioItensPedido") == undefined;
    let inot = localStorage.getItem("relatorioItensNota") == undefined;

    if(!ped || !not || !iped || !inot){
      this.componentLoading = true;
    }

    if(ped && not && iped && inot){
      this.componentLoading = false;
    }
    

    this.apiService.GET(ServicePath.HTTP_LISTA_RELATORIOS).subscribe((data: any) => {
        
        if (data != null && data != undefined && data.value != undefined && data.value.length != undefined && data.value.length > 0) {
          this.showNumberNotification = true;
          this.numberNotification = data.value.length;
          this.reports = data.value;
          this.componentLoading = false
          data.value.forEach(element => {
             if(element.tipo == "PED"){
                localStorage.removeItem("relatorioPedido");
             }else if(element.tipo == "NOT"){
                localStorage.removeItem("relatorioNota");
              }else if(element.tipo == "ITE"){
                localStorage.removeItem("relatorioItensPedido");
              }else if(element.tipo == "ITN"){
                localStorage.removeItem("relatorioItensNota");
             } 
          });
        } else {
          this.limparVariaveisRelatorio();
        }
      }, ex => {
        this.limparVariaveisRelatorio();
      })
  }

  private limparVariaveisRelatorio() {
    this.showNumberNotification = false;
    this.numberNotification = null;
    this.reports = [];
  }
}

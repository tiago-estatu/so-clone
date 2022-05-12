import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { interfaceItim } from './InterfaceItim';
import { take, takeUntil } from 'rxjs/operators';

import {
  ServicePath,
  APIService,  
  HeaderService

} from 'src/app/commons';

interface oneOption {
  codRotinaInterface: string;
  nomeInterface: string;
}

@Component({
  selector: 'rd-execucao-cadastro',
  templateUrl: './execucao-cadastro.component.html',
  styleUrls: ['./execucao-cadastro.component.scss']
})
export class ExecucaoCadastroComponent implements OnInit {

  expandir = true;
  allOptions = [] 
  loaded = true;
  inputData = [''];
  public multiFilterCtrl: FormControl = new FormControl();

  public filteredOptionsMulti: ReplaySubject<interfaceItim[]> = new ReplaySubject<interfaceItim[]>(1);
  
  protected _onDestroy = new Subject<void>();  


  constructor(
    private apiConfig: APIService,
    private headerService: HeaderService
  ) {
    this.loadFetchStatus();
  }

  ngOnInit() {

    this.headerService.setTitle("Cadastro de Execução de Interfaces");
    // set initial selection
    this.multiFilterCtrl.setValue([this.allOptions[10], this.allOptions[11], this.allOptions[12]]);
    // load the initial bank list
    this.filteredOptionsMulti.next(this.allOptions.filter(element => element.slice));

    // listen for search field value changes
    this.multiFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterOptionsMulti();
      });
  }

  loadFetchStatus() {
    const apiRequests = ServicePath.HTTP_FIND_INTERFACE_ITIM;
    this.apiConfig.GET(apiRequests).subscribe((data: any) => {      
      this.allOptions = data.value;
      this.loadOptionsList();
    }, ex => {
    });
  }
  limparTelas(){
    
  }
  loadOptionsList() {
    this.filteredOptionsMulti.next(this.allOptions.slice());
    this.multiFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterOptionsMulti();
      });
  }

  protected filterOptionsMulti() {
    if (!this.allOptions) {
      return;
    }
    let search = this.multiFilterCtrl.value;
    if (!search) {
      this.filteredOptionsMulti.next(this.allOptions.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredOptionsMulti.next(
      this.allOptions.filter(element => element.nomeInterface.toLowerCase().indexOf(search) > -1)
    );
  }

  zerarVariaveisDeBusca() { }
   
}
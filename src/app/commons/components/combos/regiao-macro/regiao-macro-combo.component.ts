import {
  Component,
  OnInit,
  ViewChild,
  Output,
  EventEmitter,
  Input
} from "@angular/core";
import { NewModalComponent } from "../..";

import { IDropdownSettings } from "ng-multiselect-dropdown";
import {
  RegiaoMacroService,
  ResultDataRegiaoMacro,
  RegiaoMacroModel
} from "src/app/commons/services/";
import { fadeInOut, UtilsHelper } from "src/app/commons";
import { HttpParams } from '@angular/common/http';
@Component({
  selector: "regiao-macro-combo",
  templateUrl: "regiao-macro-combo.component.html",
  styleUrls: ["regiao-macro-combo.component.scss"],
  providers: [RegiaoMacroService],
  animations: [fadeInOut]
})
export class RegiaoMacroComboComponent implements OnInit {
  @ViewChild(NewModalComponent) modalChild: NewModalComponent;
  mensagemModal;
  imagemModal;
  tituloModal;
  componentLoading = false;

  @Output()
  selecionados = new EventEmitter();
  @Input() cdsSelecionados;

  constructor(private _service: RegiaoMacroService, private _utils: UtilsHelper) {}
  ngOnInit(): void {
   
  }

  ngOnChanges() {
    this.limparSelecionados();
    this.preencheRegiaoMacro();
  }


  todasRegiaoParaPesquisa: number[] = [];
  dropdownRegiaoLista = [];
  regiaoSelecionadoLista = [];

  //DROPLIST SETTINGS
  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: "item_id",
    textField: "item_text",
    selectAllText: "Selecionar Todos",
    unSelectAllText: "Remover Todos",
    itemsShowLimit: 1,
    allowSearchFilter: true,
    defaultOpen: false
  };

  limparSelecionados(){
    this.regiaoSelecionadoLista = [];
    this.selecionados.emit([]);
  }
  
  selecionado(event: any[]) {
    let todosSelecionados: number[] = [];
    if(event.length > 1){
      this.regiaoSelecionadoLista = event;
    }
    this.regiaoSelecionadoLista.forEach(x =>
      todosSelecionados.push(x["item_id"])
    );
    this.selecionados.emit(todosSelecionados);
  }


  gerarFiltroCdRegional(): HttpParams{
    let params: HttpParams = new HttpParams();
    if(!this._utils.isEmpty(this.cdsSelecionados)){
      params = params.set('cdRegional', this.cdsSelecionados);
    }
    return params;
  }

  preencheRegiaoMacro() {
    this.componentLoading = true;
    this._service.buscarRegioes(this.gerarFiltroCdRegional()).subscribe(
      (res: ResultDataRegiaoMacro) => {
        let tmp = [];
        res.value.forEach(reg => {
          tmp.push({
            item_id: reg[0],
            item_text: reg[0] + ' - ' + reg[1]
          });
        });
        this.dropdownRegiaoLista = tmp;
        this.componentLoading = false;
      },
      ex => {
        this.componentLoading = false;
        if (ex.status === 404) {
          this.mensagemModal = ex.error.mensagem;
          this.imagemModal = "warning";
          this.tituloModal = "Nenhum dado encontrado";
          this.modalChild.openModal = true;
        }

        this.modalChild.somErro = true;
      }
    );
    
  }
}

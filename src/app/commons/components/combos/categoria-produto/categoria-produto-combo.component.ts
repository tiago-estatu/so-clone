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
  CategoriaProdutoService,
  CategoriaProdutoModel
} from "src/app/commons/services/categoria-produto";
import { fadeInOut } from "src/app/commons";
@Component({
  selector: "categoria-produto-combo",
  templateUrl: "categoria-produto-combo.component.html",
  styleUrls: ["categoria-produto-combo.component.scss"],
  providers: [CategoriaProdutoService],
  animations: [fadeInOut]
})
export class CategoriaProdutoComboComponent implements OnInit {
  @ViewChild(NewModalComponent) modalChild: NewModalComponent;
  componentLoading = false;
  mensagemModal;
  imagemModal;
  tituloModal;

  @Output()
  selecionados = new EventEmitter();

  @Input()
  disabled: string;

  constructor(private _service: CategoriaProdutoService) {}

  ngOnInit(): void {
    this.preencheCategoriaProduto();
  }

  todasCategoriasProdutoParaPesquisa: number[] = [];
  dropdownCategoriaProdutoLista = [];
  categoriaProdutoSelecionadoLista = [];

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
    let todosSelecionados: number[] = [];
    this.categoriaProdutoSelecionadoLista = [];
    this.selecionados.emit(todosSelecionados);
  }
  selecionado(event: any[]) {
    let todosSelecionados: number[] = [];
  
    if(event.length > 1){
      this.categoriaProdutoSelecionadoLista = event;
    }
    this.categoriaProdutoSelecionadoLista.forEach(x =>
      todosSelecionados.push(x["item_id"])
    );
    this.selecionados.emit(todosSelecionados);
  }
  preencheCategoriaProduto() {
     this.componentLoading = true;
    this._service.buscarTodasCategoriasProduto().subscribe(
      (res: CategoriaProdutoModel[]) => {
        let tmp = [];
        res.forEach(cat =>
          tmp.push({
            item_id: cat.cd,
            item_text: cat.cd + " - " + cat.descricao
          })
        );
        this.dropdownCategoriaProdutoLista = tmp;
        this.componentLoading = false;
      },
      ex => {
        this.componentLoading = false;
        this.mensagemModal = ex.error.mensagem;
        this.imagemModal = "warning";
        this.tituloModal = ex.status === 404 ? "Nenhum dado encontrado" : "Oops";
        this.modalChild.openModal = true;
        this.modalChild.somErro = true;
      }
    );
  }
}

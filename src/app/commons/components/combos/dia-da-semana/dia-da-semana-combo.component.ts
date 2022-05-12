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
import { fadeInOut } from "src/app/commons";
@Component({
  selector: "rd-dia-da-semana-combo",
  templateUrl: "dia-da-semana-combo.component.html",
  styleUrls: ["dia-da-semana-combo.component.scss"],
  animations: [fadeInOut]
})
export class DiaSemanaComboComponent implements OnInit {
  @ViewChild(NewModalComponent) modalChild: NewModalComponent;
  componentLoading = false;
  mensagemModal;
  imagemModal;
  tituloModal;
  dropdownSettings: IDropdownSettings;
  @Output()
  selecionados = new EventEmitter();

  @Input()
  single: boolean;

  @Input()
  disabled: string;

  constructor() {}

  ngOnInit(): void {
    this.preencheDiaDaSemana();
  if(this.single === undefined){
    this.single = false;
  }
    //DROPLIST SETTINGS
  this.dropdownSettings = {
    singleSelection: this.single,
    idField: "item_id",
    textField: "item_text",
    selectAllText: "Selecionar Todos",
    unSelectAllText: "Remover Todos",
    itemsShowLimit: 1,
    allowSearchFilter: true,
    defaultOpen: false
  };
  }

  dropdownDiaDaSemana = [];
  diaDaSemanaSelecionado = [];


  limparSelecionados(){
    let todosSelecionados: number[] = [];
    this.diaDaSemanaSelecionado = [];
    this.selecionados.emit(todosSelecionados);
  }
  selecionado(event: any[]) {
    let todosSelecionados: number[] = [];

    if(event.length > 1){
      this.diaDaSemanaSelecionado = event;
    }
    this.diaDaSemanaSelecionado.forEach(x =>
      todosSelecionados.push(x["item_id"])
    );
    this.selecionados.emit(todosSelecionados);
  }

  preencheDiaDaSemana() {
    this.dropdownDiaDaSemana = [
      { item_id: 1, item_text: 'Domingo' },
      { item_id: 2, item_text: 'Segunda-feira' },
      { item_id: 3, item_text: 'Terça-feira' },
      { item_id: 4, item_text: 'Quarta-feira' },
      { item_id: 5, item_text: 'Quinta-feira' },
      { item_id: 6, item_text: 'Sexta-feira' },
      { item_id: 0, item_text: 'Sábado' },
    ];

  }
}

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
import { ClusterService, fadeInOut } from "src/app/commons";
@Component({
  selector: "rd-cluster-combo",
  templateUrl: "cluster-combo.component.html",
  styleUrls: ["cluster-combo.component.scss"],
  animations: [fadeInOut]
})
export class ClusterComboComponent implements OnInit {
  componentLoading = false;
  dropdownSettings: IDropdownSettings;

  @Output() selecionados = new EventEmitter();

  @Input() disabled: string;

  
  dataSource = [];
  clusterSelecionado = [];

  constructor(private _service: ClusterService) {}

  ngOnInit(): void {
    this.preencheCluster();
  
    //DROPLIST SETTINGS
    this.dropdownSettings = {
      singleSelection: true,
      idField: "item_id",
      textField: "item_text",
      selectAllText: "Selecionar Todos",
      unSelectAllText: "Remover Todos",
      itemsShowLimit: 1,
      allowSearchFilter: true,
      defaultOpen: false
    };
  }



  limparSelecionados(){
    let todosSelecionados: number[] = [];
    this.clusterSelecionado = [];
    this.selecionados.emit(todosSelecionados);
  }
  selecionado(event: any[]) {
    let todosSelecionados: number[] = [];

    if(event.length > 1){
      this.clusterSelecionado = event;
    }
    this.clusterSelecionado.forEach(x =>
      todosSelecionados.push(x["item_id"])
    );
    this.selecionados.emit(todosSelecionados);
  }

  preencheCluster() {
    this._service.getAllCluster().subscribe(data => {
      let tmp:any = [];
      data.forEach(cluster => {
        tmp.push({
          item_id: cluster.cd,
          item_text: cluster.descricao
        });
      })

      this.dataSource = tmp;
    }, err => {
    })

  }
}

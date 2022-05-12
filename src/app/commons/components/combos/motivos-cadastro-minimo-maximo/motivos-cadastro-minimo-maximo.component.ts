import { MinimoMaximoService } from 'src/app/commons/services';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { FormBuilder, FormControl } from '@angular/forms';
import { Component, Input, Output, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'rd-motivos-cadastro-minimo-maximo',
  templateUrl: './motivos-cadastro-minimo-maximo.component.html',
  styleUrls: ['./motivos-cadastro-minimo-maximo.component.scss'],
  providers: [MinimoMaximoService],

})
export class MotivosCadastroMinimoMaximoComponent implements OnInit {

  constructor(
    private _service: MinimoMaximoService,
    private _fb: FormBuilder
  ) { }

  @Output() 
  selecionados = new EventEmitter();
  @Input()
  control?: FormControl = new FormControl;
  @Input()
  disabled: boolean

  dropdownSettings:IDropdownSettings = {
    singleSelection: true,
    idField: "item_id",
    textField: "item_text",
};

  motivoSelecionadoLista = [];
  $motivos = new BehaviorSubject<any[]>([])

  ngOnInit() {
    this.control = this.control || this._fb.control("");

    this.motivoSelecionadoLista = [];

    this.carregarDados();
  }

  ngOnChanges(): void{
    this.carregarDados();
    this.limparSelecionados();
  }

  carregarDados(){
    this._service.getMotivoMinimoMaximo().subscribe(data => {
      this.$motivos.next(data || []) 
    })
  }

  selecionado() {
    const todosSelecionados: number[] = [];
    this.motivoSelecionadoLista.forEach(x => todosSelecionados.push(x['item_id']));
    this.selecionados.emit(todosSelecionados);
  }
  
  limparSelecionados() {
    const todosSelecionados: number[] = [];
    this.motivoSelecionadoLista = [];
    this.selecionados.emit([todosSelecionados]);
  }

}

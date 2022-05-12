import { Component, OnInit, Inject, Input, Output,EventEmitter } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { AgendaFaturamentoModel } from 'src/app/commons/services/agendaFaturamento/agendaFaturamento.model';

@Component({
  selector: 'rd-suspender-faturamento-detalhe',
  templateUrl: './suspender-faturamento-detalhe.component.html',
  styleUrls: ['./suspender-faturamento-detalhe.component.scss']
})
export class SuspenderFaturamentoDetalheComponent implements OnInit {

  constructor(
      private _dialogRef: MatDialogRef<SuspenderFaturamentoDetalheComponent>,
      @Inject(MAT_DIALOG_DATA) public data: AgendaFaturamentoModel
  ) { }

  // ENVIANDO DADOS PARA POPULAR A DETALHE DO FATURAMENTO SUSPENSO
  dadosParaDetalhe: AgendaFaturamentoModel;

  ngOnInit() {
    this.dadosParaDetalhe = this.data;

  }

    fecharDetalhe() {
        this._dialogRef.close();
    }

}

import { Component, OnInit, Inject} from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "rd-agenda-suspensa-cd-detalhe",
  templateUrl: "./agenda-suspensa-cd-detalhe.component.html",
  styleUrls: ["./agenda-suspensa-cd-detalhe.component.scss"]
})

export class AgendaSuspensaCdModalComponent implements OnInit {
   constructor(
    public dialogRef: MatDialogRef<AgendaSuspensaCdModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  // ENVIANDO DADOS PARA POPULAR A DETALHE DA AGENDA SUSPENSA CD
  dadosParaDetalhe: any;

  ngOnInit() {
    this.dadosParaDetalhe = this.data;
  }

    fecharDetalhe() {
        this.dialogRef.close();
    }

}
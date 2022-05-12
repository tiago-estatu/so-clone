import { Component, OnInit, Input, HostListener } from '@angular/core';
import { NewModalComponent } from '../new-modal';

@Component({
  selector: 'rd-buttons-modal',
  templateUrl: './buttons-modal.component.html',
  styleUrls: ['./buttons-modal.component.scss']
})
export class ButtonsModalComponent implements OnInit {


  @HostListener('window:keydown', ['$event'])
  onKeyDown(event) {
    if (this.modal.openModal && !this.modal.funcaoPersonalizada) {
      if (event.key === 'Escape') {
        if (this.modal.btnVoltar) {
          this.funcBtnVoltar();
        } else if (!this.modal.btnVoltar) {
          this.btnCloseModal();
        }
      }

      if (event.key === 'Enter') {
        if (this.modal.btnNameConfirmar != undefined && this.btnConfirmarForm != true) {
          this.funcBtnConfirmar();
        }
      }
    }
  }



  @Input() btnCancelName = "Fechar";
  @Input() btnVoltar = false;
  @Input() colorBtnPrincipal = 'green';
  @Input() btnNameConfirmar = 'Salvar';
  @Input() btnConfirmar = false;
  @Input() btnVoltarConfirmar = false;
  btnConfirmarForm = false;
  


  constructor(private modal: NewModalComponent) { }

  ngOnInit() {
  }

  funcBtnConfirmar(){
    this.modal.funcBtnConfirmar();
  }

  funcBtnVoltar(){
    this.modal.funcBtnVoltar();
  }


  btnCloseModal(){
    this.modal.btnCloseModal();
  }

}

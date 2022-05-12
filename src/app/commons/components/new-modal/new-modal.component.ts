import { Component, EventEmitter, Output, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'rd-new-modal',
  templateUrl: './new-modal.component.html',
  styleUrls: ['./new-modal.component.scss']
})


export class NewModalComponent {

  @Input() rotaVoltar = '';
  @Input() btnCancelName = "Fechar";

  @Input() funcaoPersonalizada = false;

  @Input() somSucess = false;
  @Input() mensagemModal = '';
  @Input() tituloModal = '';
  @Input() imagemModal = '';
  @Input() btnConfirmarForm = false;
  @Input() btnVoltarConfirmar = false;

  @Output() fechou = new EventEmitter<boolean>();
  @Output() outputConfirmar = new EventEmitter<any>();

  constructor(
    private router: Router
  ) { }

  btnVoltar = false;
  colorBtnPrincipal = 'green';
  btnNameConfirmar = 'Salvar';
  erro = false;
  openModal = false;
  conteudoModal = false;
  btnConfirmar = false;
  botoesPrincipais = true;
  somErro = false;
  modalLargeSize = false;
  modalMediumSize = false;


  btnCloseModal() {
    this.btnVoltar = false;
    this.colorBtnPrincipal = 'green';
    this.openModal = false;
    this.conteudoModal = false;
    this.btnConfirmar = false;
    this.btnConfirmarForm = false;
    this.botoesPrincipais = true;
    this.modalLargeSize = false;
    this.modalMediumSize = false;
    this.somErro = false;
    if(this.imagemModal === 'check'){
      this.fechou.emit(true);
    }
    if( this.btnVoltarConfirmar){
      this.funcBtnVoltar();
    }
  }

  funcBtnVoltar() {

    this.router.navigateByUrl(this.rotaVoltar);
  }

  funcBtnConfirmar() {
    this.outputConfirmar.emit();
    this.btnCloseModal();
  }
}

import { Component, OnInit, ViewEncapsulation, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'rd-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ModalComponent implements OnInit {

  constructor(
    private router: Router
  ) { }

  ngOnInit() { }

  display = 'none';
  titulo = "";
  imagemModal = "";
  modalGrande = false;
  modalMedio = false;
  modalPequeno = false;
  modalPPequeno = false;
  modalUmInput = false;

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event) {
    if (event.key === 'Escape') {
      this.fecharModal();
    }
  }
  

  fecharModal() {
    this.display = 'none';
    this.titulo = "";
    this.imagemModal = "";
    this.modalGrande = false;
    this.modalMedio = false;
    this.modalPequeno = false;
    this.modalUmInput = false;
    let url = this.router.url;
    this.router.navigateByUrl('/carregamento', {skipLocationChange: true}).then(()=>
    this.router.navigate([url]));
  }

  abrirModal() {
    this.display = 'block';
  }

}

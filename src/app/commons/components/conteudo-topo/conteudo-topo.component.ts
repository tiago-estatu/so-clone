import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'rd-conteudo-topo',
  templateUrl: './conteudo-topo.component.html',
})
export class ConteudoTopoComponent {

  @Input() rotaVoltar = '';
  @Input() textoVoltar = 'Voltar';
  @Input() tituloPagina = '';
  @Input() subtituloPagina = '';

  constructor(private router: Router) { }

  backBtn() {
    this.router.navigateByUrl(this.rotaVoltar);
  }

}

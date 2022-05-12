import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'rd-sound',
  templateUrl: './sound.component.html',
  styleUrls: ['./sound.component.scss']
})
export class SoundComponent implements OnInit {

  constructor() { }

  @Input() somErro = false;
  @Input() somSucess = false;

  ngOnInit() {
  }
  
}

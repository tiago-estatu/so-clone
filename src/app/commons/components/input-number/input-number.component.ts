import { Component, Output, Input, EventEmitter } from '@angular/core';

@Component({
  selector: 'rd-input-number',
  templateUrl: './input-number.component.html',
  styleUrls: ['./input-number.component.scss']
})
export class InputNumberComponent {

  @Output() inputNumberOut = new EventEmitter();
  @Input() inputNumber = 1;
  @Input() maxNumber;


  constructor() {}

  minusNumber() {
    if (this.inputNumber > 1) {
      this.inputNumber = this.inputNumber - Number(1);
    }

    this.inputNumberOut.emit(this.inputNumber);
  }

  plusNumber() {

    if(this.maxNumber == this.inputNumber){
      return;
    }

    this.inputNumber = this.inputNumber + Number(1);
    
    this.inputNumberOut.emit(this.inputNumber);



  }

}

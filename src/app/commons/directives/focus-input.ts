import { Directive, ElementRef, Renderer2, Input } from '@angular/core';

@Directive({
  selector: '[myFocus]'
})
export class FocusDirective {

  @Input('myFocus') isFocused: boolean;

  constructor(private hostElement: ElementRef, private renderer: Renderer2) { }

  ngOnChanges() {
    if (this.isFocused) {   
      this.hostElement.nativeElement.focus();
    }
  }
}

import { AfterContentChecked, AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NgSelectConfig } from '@ng-select/ng-select';
import { ViewEncapsulation } from '@angular/core';
import { fadeIn, fadeInOut } from './commons';
import { LoadingService } from './commons/services/loading';


@Component({
  selector: 'rd-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    fadeInOut,
    fadeIn
  ]
})
export class AppComponent implements AfterContentChecked{
  title = 'Stock Optimisation';

  public constructor(
    private _titleService: Title,
    private _config: NgSelectConfig,
    private _loading: LoadingService,
    private _cdr: ChangeDetectorRef
  ) {
    this._config.notFoundText = 'Custom not found';
  }

  public setTitle(newTitle: string) {
    this._titleService.setTitle(newTitle);
  }

  get componentLoading(){
    return this._loading.getStatus();
  }

  ngAfterContentChecked() : void {
    this._cdr.detectChanges();
}

}

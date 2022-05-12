import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable()
export class HeaderService {
  public title = new BehaviorSubject('Title');

  constructor() { }

  setTitle(title) {
    this.title.next(title);
  }
}

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  private load: boolean = false;

  constructor() { }

  public carregar(){
    this.load = true;
  }

  public parar(){ 
    this.load = false;
  };

  public getStatus(){
    return this.load;
  }

}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  api = environment;

  constructor( private http: HttpClient ) { }

  login(raw) {
    return this.http.post(this.api+"/login", raw);
  }
}

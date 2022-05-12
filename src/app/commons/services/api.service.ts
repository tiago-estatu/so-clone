import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, ResponseContentType } from '@angular/http';
import { UtilsHelper } from '../helpers';





@Injectable()
export class APIService {



  constructor(public httpClient: HttpClient, private http : Http, private utils: UtilsHelper) {
  }

  GET(url) {
    return this.httpClient.get(url, this.getHeader());
  }

  GET_HEADER(url,valor) {
    return this.httpClient.get(url, this.getHeader(valor));
  }

  GETEST(url) {
    return this.httpClient.get(url, this.getHeaderTeste());
  }

  downloadFile(url) {

    const headers = new Headers();
    //headers.append('Accept', contentType);
    headers.append('authorization', localStorage.getItem('token'))

    let options = new RequestOptions({responseType: ResponseContentType.Blob });
    options.headers = headers;
    return this.http.get(url, options);
        
  }

  getWithContentType(url, content_type) {
    const headers = new Headers();
    headers.append('Accept', content_type);
    headers.append('authorization', localStorage.getItem('token'))
    return  this.http.get(url, { headers: headers });
  }

  PATCH(url, body?) {
    return this.httpClient.patch(url, body, this.getHeader());
  }

  

  DELETE(url, body) {
    const httpOptions = {
      headers: new HttpHeaders({ 
        'Content-Type': 'application/json',
        'authorization': localStorage.getItem('token')
     }), body
  };
    
    new Promise(resolve => {
      this.httpClient.delete(url, httpOptions).subscribe(res => {     
        localStorage.setItem("retornoExclusao", JSON.stringify(res));
      }, err => {               
        localStorage.setItem("retornoExclusao", JSON.stringify(err));
      });
    });
}

  DELETE_PROMISE(url, body) {
    const httpOptions = {
      headers: new HttpHeaders({ 
        'Content-Type': 'application/json',
        'authorization': localStorage.getItem('token')
       }), body
    };
  
    return this.httpClient.delete(url, httpOptions);
  }


  POST(url, body?, valorHeader?) {
    return this.httpClient.post(url, body, this.getHeader(valorHeader));
  }

  PUT(url, body) {
    return this.httpClient.put(url, body, this.getHeader());
  }

  getHeader(valor?){
    if(this.utils.isEmpty(valor)){
      return {
        headers: {
          'Content-Type': 'application/json',
          'authorization': localStorage.getItem('token')
        }
      };
    }else{
      return {
        headers: {
          'Content-Type': 'application/json',
          'authorization': localStorage.getItem('token'),
          'tipo': valor
        }
      };
    }
    
  }

  getHeaderTeste(){
    return {
      headers: {
        'Content-Type': 'application/json',
        'authorization': localStorage.getItem('token'),
        'Accept-Encoding': 'ANSI'
      }
    };
  }

}



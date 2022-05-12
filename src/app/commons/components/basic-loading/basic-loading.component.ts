import { Component, OnInit } from '@angular/core';
import { Injectable } from '@angular/core';

@Component({
  selector: 'rd-basic-loading',
  templateUrl: './basic-loading.component.html',
  styleUrls: ['./basic-loading.component.scss']
})

@Injectable()
export class BasicLoadingComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}

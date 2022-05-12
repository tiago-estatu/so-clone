import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CommonsModule } from "../commons/commons.module";
import { RouterModule } from "@angular/router";
import { MinimoMaximoComponent } from "./minimo-maximo.component";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { MatToolbarModule } from "@angular/material/toolbar";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatChipsModule } from "@angular/material";
import { ConsultaMinimoMaximoComponent } from "./minimo-maximo-consulta";
import { GridMinimoMaximoComponent } from "./minimo-maximo-consulta/grid-minimo-maximo"
import { NgxPaginationModule } from 'ngx-pagination';
@NgModule({
  providers: [], //ExcelService
  declarations: [MinimoMaximoComponent, ConsultaMinimoMaximoComponent, GridMinimoMaximoComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    // Material Modules
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatSortModule,
    MatTableModule,
    MatToolbarModule,
    MatPaginatorModule,
    CommonsModule,
    NgxMatSelectSearchModule,
    MatButtonToggleModule,
    MatChipsModule,
    NgxPaginationModule
  ],
  entryComponents: [MinimoMaximoComponent]
  // exports: [MinimoMaximoComponent, ConsultaMinimoMaximoComponent]
})
export class MinimoMaximoModule {}

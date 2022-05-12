import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { NewModalComponent } from '../new-modal';
import { APIService } from '../../services';
import { ValidatorHelper } from '../../helpers';
import { ServicePath, fadeInOut } from '../../const';
import {environment} from "../../../../environments/environment";



@Component({
  selector: 'rd-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  animations: [fadeInOut]
})


export class SidebarComponent implements OnInit {

  @ViewChild(NewModalComponent) modalChild: NewModalComponent;
  @ViewChild('sidebar') sidebar;


  @HostListener("window:scroll", [])
  onWindowScroll() {
    this.getScreenSize();
  }


  menus = [];
  screenHeight: any;
  classToggleMenu;
  clickedToggleMenu;
  rotaVoltar = '/login';
  loaded = false;
  heightStyle: number;
  fixed = false;
  fraseMenu = 'Recolher menu';
  hoverMenu;
  mensagemModal;
  tituloModal; 
  imagemModal;


  constructor(
    private apiConfig: APIService,
    private validator: ValidatorHelper,
  ) { }

  ngOnInit() {
    this.carregarMenu();
  }

  toogleMenu(event: any) {
    event.preventDefault();
    this.clickedToggleMenu = this.clickedToggleMenu === true ? this.clickedToggleMenu = false : this.clickedToggleMenu = true;
    this.classToggleMenu = this.classToggleMenu === true ? this.classToggleMenu = false : this.classToggleMenu = true;
    this.fraseMenu = this.fraseMenu === 'Recolher menu' ? this.fraseMenu = 'Fixar menu' : this.fraseMenu = 'Recolher menu';

  }


  mouseEnterList(i) {
    this.classToggleMenu = false;
  }

  mouseLeaveList() {

    this.hoverMenu = false;
    if (this.clickedToggleMenu === true) {

      setTimeout(x => {
        this.classToggleMenu = true;
      }, 200);

    }
  }


  getScreenSize() {

    this.screenHeight = this.sidebar.nativeElement.clientHeight;
    this.heightStyle = (this.screenHeight) - 64;
    const heightSidebar = this.heightStyle;
    const menusHeight = this.menus.length * 52 + 30;
    const documentHeight = document.documentElement.clientHeight - 64;

    if (heightSidebar > menusHeight) {

      if (documentHeight < menusHeight) {

        if (document.documentElement.scrollTop > menusHeight) {
          this.fixed = true;
        } else {
          this.fixed = false;
        }
      } else {
        this.fixed = true;
      }

    } else {
      this.fixed = false;
    }


  }


  carregarMenu() {
    this.loaded = false;

    this.apiConfig.GET(ServicePath.HTTP_MENUS).subscribe((data: any) => {
      data.value.forEach(menu => {

        const jsonMenu = {
          "nomeMenu": '',
          "rotaMenu": '',
          "icone": '',
          subMenu: []
        };

        jsonMenu.nomeMenu = menu.menuNome;
        jsonMenu.icone = menu.menuIcone;


          for (let index = 0; index < menu.itens.length; index++) {

            var jsonSubMenu = {
              "nome": '',
              "rota": ''
            };

            jsonSubMenu.nome = menu.itens[index].nome;
            jsonSubMenu.rota = menu.itens[index].rotaSubmenu;
            jsonMenu.subMenu.push(jsonSubMenu);

          }
          // jsonMenu.rotaMenu = jsonSubMenu.rota;


        this.menus.push(jsonMenu);
      });


      this.getScreenSize();


    }, ex => {
      this.mensagemModal = 'Erro ao carregar menu, verifique seus acessos e tente novamente.';
      this.imagemModal = 'warning';
      this.tituloModal = 'Erro!';
      this.modalChild.btnVoltar = true;
      //if(!environment.local) this.modalChild.openModal = true;
      //this.validator.error(ex);

    }).add(() => {
      this.loaded = true;
    });;
  }

}

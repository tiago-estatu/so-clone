import {SelectionModel} from '@angular/cdk/collections';
import {FlatTreeControl} from '@angular/cdk/tree';
import {ChangeDetectionStrategy, Component, Injectable, Input, OnInit, Output} from '@angular/core';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import { EventEmitter } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import { UtilsHelper, ValidatorHelper } from '../../helpers';
import { PerfilAcessoService, PerfilRotasService } from '../../services';
import { ConsultaPedidoDetalheResolver } from 'src/app/pedidos/consulta-pedido/consulta-pedido-detalhe/consulta-pedido-detalhe.resolver';

/**
 * Node for to-do item
 */
export class TodoItemNode {
  menuItens?: TodoItemNode[];
  dsMenu?: string;
  cdMenu?: number;
  cdItem?: number;
  dsItem?: string;
  fgAtivo?: boolean;
}
''
/** Flat to-do item node with expandable and level information */
export class TodoItemFlatNode {
  dsItem?: string;
  cdItem?: number;
  cdMenu: number;
  dsMenu: string;
  level: number;
  expandable: boolean;
  fgAtivo?: boolean;
  menuItens?: TodoItemNode[];
}

/**
 * Checklist database, it can build a tree structured Json object.
 * Each node in Json object represents a to-do item or a category.
 * If a node is a category, it has children items and new items can be added under the category.
 */
@Injectable()
export class ChecklistDatabase {

  dataChange = new BehaviorSubject<TodoItemNode[]>([]);
  valores = [];
  get data(): TodoItemNode[] { 
    return this.dataChange.value; 
  }

  constructor() {

    this.initialize(this.valores);
  }

  initialize(values: any[]) {
    let data = [];
    data = this.buildFileTree(values);
    // Notify the change.
    this.dataChange.next(data);
  }

  /**
   * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
   * The return value is the list of `TodoItemNode`.
   */
  buildFileTree(obj: TodoItemNode[]): TodoItemNode[] {
    let dsMenu = '';
    let node = new TodoItemNode();
   
    obj.forEach(x => {
      dsMenu = x.dsMenu
      node.dsMenu = dsMenu
      node.menuItens = x.menuItens
      node.cdMenu = x.cdMenu
    });
    
    return obj;
  }

}


/**
 * @title Tree with checkboxes
 */
@Component({
  selector: 'arvore-selecao-dados',
  templateUrl: 'arvore-selecao-dados.component.html',
  styleUrls: ['arvore-selecao-dados.component.scss'],
  providers: [ChecklistDatabase],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArvoreSelecaoTreeComponent implements OnInit{
  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<TodoItemFlatNode, TodoItemNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<TodoItemNode, TodoItemFlatNode>();

  /** A selected parent node to be inserted */
  selectedParent: TodoItemFlatNode | null = null;

  /** The new item's name */
  newItemName = '';

  treeControl: FlatTreeControl<TodoItemFlatNode>;

  treeFlattener: MatTreeFlattener<TodoItemNode, TodoItemFlatNode>;

  dataSource: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;

  @Output() selecionados :any = new EventEmitter();

  @Input() idClone!:number;

  /** The selection for checklist */
    checklistSelection = new SelectionModel<TodoItemFlatNode>(true /* multiple */);

  constructor(private _database: ChecklistDatabase,
    private _service: PerfilRotasService,
    private _utils: UtilsHelper,) {

    this.emitirEventoSelecionar();
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
      this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    _database.dataChange.subscribe(data => {
      this.dataSource.data = data;
    });
  }

  ngOnInit(): void {
    if(null!== this.idClone){

      this._service.getAllRotasPerfilPorId(this.idClone).subscribe(x => {
        this._database.initialize(x);
      });

    }else{
      this._service.getAllRotasPerfil().subscribe(x => {
        this._database.initialize(x);
      });
    }
    
  }

  getLevel = (node: TodoItemFlatNode) => node.level || 0;

  isExpandable = (node: TodoItemFlatNode) => node.expandable;

  getChildren(node: TodoItemNode): TodoItemNode[] {
    node.menuItens.forEach(x => {
      x.cdMenu = node.cdMenu;
    });
    return node.menuItens
  };

  hasChild = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.dsItem === '';

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: TodoItemNode, level: number) => {

    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.dsMenu === node.dsMenu
        ? existingNode
        : new TodoItemFlatNode();

        
        if(!this._utils.isEmpty(node.dsMenu)){
          flatNode.dsMenu = node.dsMenu;
          flatNode.level = 0;
        }else{
          flatNode.level = level;
          flatNode.dsMenu = node.dsItem;
        }

    flatNode.cdMenu = node.cdMenu;
    flatNode.cdItem = node.cdItem;
    flatNode.fgAtivo = node.fgAtivo;
    
    if(flatNode.fgAtivo){
      this.todoLeafItemSelectionToggle(flatNode);
    }


    flatNode.expandable = !this._utils.isEmpty(node.menuItens);
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);

    return flatNode;

  }


  /** Whether all the descendants of the node are selected. */
  descendantsAllSelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.length > 0 && descendants.every(child => {
      return this.checklistSelection.isSelected(child);
    });
    return descAllSelected;
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: TodoItemFlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    // Force update for the parent
    descendants.forEach(child => this.checklistSelection.isSelected(child));
    this.checkAllParentsSelection(node);
  }

  /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
  todoLeafItemSelectionToggle(node: any): void {
    this.checklistSelection.toggle(node);
    this.checkAllParentsSelection(node);
  }

  /* Checks all the parents when a leaf node is selected/unselected */
  checkAllParentsSelection(node: TodoItemFlatNode): void {
    let parent: TodoItemFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
    this.emitirEventoSelecionar();
  }

  /** Check root node checked state and change it accordingly */
  checkRootNodeSelection(node: TodoItemFlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.length > 0 && descendants.every(child => {
      return this.checklistSelection.isSelected(child);
    });
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
    }

    this.emitirEventoSelecionar();
  }

  /* Get the parent node of a node */
  getParentNode(node: TodoItemFlatNode): TodoItemFlatNode | null {
    const currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  emitirEventoSelecionar(){
    this.selecionados.emit(this.checklistSelection);
  }
}
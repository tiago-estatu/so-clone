



  /** Whether the number of selected elements matches the total number of rows. */
  export function isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.posts.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  export function masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.posts.data.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  export function checkboxLabel(row?) {
    if (!row) {
      this.isAllSelected();
    }
    this.selection.isSelected(row);
  }
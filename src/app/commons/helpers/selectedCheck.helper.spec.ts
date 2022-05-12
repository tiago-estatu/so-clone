import {checkboxLabel, isAllSelected, masterToggle} from "./selectedCheck";
class AllItems {
    selection = {
        selected: [1, 2, 3], clear: () => {
            this.selection.selected = []
        }, select: (item) => {
            this.selection.selected.push(item)
        },
        isSelected: (row) => {
            return this.selection.selected.indexOf(row) > -1;
        }
    };
    posts = {data: [1, 2, 3]};
    isAllSelected = isAllSelected;
    masterToggle = masterToggle;
    checkBoxLabel = checkboxLabel;

    constructor() {

    }

}

describe('Selected Check Helper', () => {

    // TESTS CASES
    it('Should have exported all the functions', () => {
        expect(isAllSelected).toBeTruthy();
        expect(masterToggle).toBeTruthy();
        expect(checkboxLabel).toBeTruthy();
    });

    describe('Define isALlSelected', () => {


        it('Should return true if all items are selected', () => {


            let isAll = new AllItems();
            expect(isAll.isAllSelected()).toEqual(true);
            isAll.selection.selected.push(55);
            isAll.posts.data.push(55);
            expect(isAll.isAllSelected()).toEqual(true);


        });

        it('Should return false if not all items are selected', () => {

            let isAll = new AllItems();
            expect(isAll.isAllSelected()).toEqual(true);
            isAll.selection.selected.push(55);
            isAll.selection.selected.push(24);
            isAll.posts.data.push(55);
            expect(isAll.isAllSelected()).toEqual(false);

        });
    });

    describe('Master Toggle', () => {


        it('Should unselect all selected items if all items are selected', () => {
            let allItems = new AllItems();
            expect(allItems.isAllSelected()).toEqual(true);
            allItems.masterToggle();
            expect(allItems.isAllSelected()).toEqual(false);

        });

        it('Should select all selected items if all items are not selected', () => {
            let allItems = new AllItems();
            allItems.selection.clear();
            expect(allItems.isAllSelected()).toEqual(false);
            allItems.masterToggle();
            expect(allItems.isAllSelected()).toEqual(true);
        })
    });

    describe('CheckBoxLabel function', () => {
        it('Should call the correct isSelected function when a row is sent', () => {
            let allItems = new AllItems();
            spyOn(allItems.selection, 'isSelected');
            allItems.checkBoxLabel(1);
            expect(allItems.selection.isSelected).toHaveBeenCalledTimes(1);
        });

        it('Should call the correct isAllSelected function when no row is sent', () => {
            let allItems = new AllItems();
            spyOn(allItems, 'isAllSelected');
            allItems.checkBoxLabel();
            expect(allItems.isAllSelected).toHaveBeenCalledTimes(1);
        })
    })

});
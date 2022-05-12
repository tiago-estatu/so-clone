import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "dropmap" })
export class DropdownMapperPipe implements PipeTransform {
  transform(value: any[], id: string, label: string, addLabel?: string): any[] {
    if (!value) value = [];
    return value.map(item => ({ item_id: item[id], item_text: label.split('-').map(key => item[key] || '').join(' - ') + ( addLabel || ('') ) }));
  }
}

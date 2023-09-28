import { Pipe, PipeTransform } from "@angular/core";

@Pipe({name: 'clean'})
export class Clean implements PipeTransform{
    transform(str: string): string{
        return str.replaceAll("_", " ");
    }
}
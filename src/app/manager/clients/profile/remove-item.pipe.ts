import { Pipe, PipeTransform } from '@angular/core';
import { Subscription } from 'src/app/shared/client.model';

@Pipe({
  name: 'removeItem'
})
export class RemoveItemPipe implements PipeTransform {

  transform(s: Subscription, item: any): any {
    if (!s) {
      return s;
    }
    s.subscriberIds = s.subscriberIds.filter(v => v !== item);
    return s;
  }

}

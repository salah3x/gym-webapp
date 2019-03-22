import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { ClientAddComponent } from './client-add.component';

export class CanDeactivateClient implements CanDeactivate<ClientAddComponent> {

  canDeactivate(component: ClientAddComponent,
                currentRoute: ActivatedRouteSnapshot,
                currentState: RouterStateSnapshot,
                nextState: RouterStateSnapshot): boolean | UrlTree | Observable<boolean |
                                                  UrlTree> | Promise<boolean | UrlTree> {
    return component.canDeactivate();
  }

  constructor() { }
}

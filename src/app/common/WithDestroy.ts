import { OnDestroy } from "@angular/core";
import { Subject } from "rxjs";
export declare type Constructor<T> = new (...args: any[]) => T;

export function WithDestroy<T extends Constructor<{}>>(Base: T = (class {} as any)) {
  return class extends Base implements OnDestroy {
    destroy$  = new Subject<void>()

    ngOnDestroy() {
      //console.log('WithDestroy ==> ngOnDestroy', this);
      this.destroy$.next();
    }
  }
}

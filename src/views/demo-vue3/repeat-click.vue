<template>
  <a-button v-repeatClick="handleClick">点我</a-button>
</template>

<script lang="ts">
import { defineComponent, DirectiveBinding } from 'vue';

export default defineComponent({
  directives: {
    repeatClick: {
      beforeMount(el: Element, binding: DirectiveBinding<any>) {
        let interval: any = null;
        let startTime = 0;
        const handler = (): void => binding?.value();
        const clear = (): void => {
          handler();
          // if (Date.now() - startTime < 100) {
          //   handler();
          // }
          // interval && clearInterval(interval);
          // interval = null;
        };

        on(el, 'mousedown', (e: MouseEvent): void => {
          if ((e as any).button !== 0) return;
          const currentTime = Date.now();
          if (currentTime - startTime < 500) return;
          startTime = currentTime;
          once(document as any, 'mouseup', clear);
          // interval && clearInterval(interval);
          // interval = setInterval(handler, 100);
        });
      },
    }
  },
  setup() {
    const handleClick = ()=>{
      console.log(1);
    };

    return {
      handleClick,
    }
  },
});

export function on(
  element: Element | HTMLElement | Document | Window,
  event: string,
  handler: any,
): void {
  if (element && event && handler) {
    element.addEventListener(event, handler, false);
  }
}

/* istanbul ignore next */
export function off(
  element: Element | HTMLElement | Document | Window,
  event: string,
  handler: any,
): void {
  if (element && event && handler) {
    element.removeEventListener(event, handler, false);
  }
}

/* istanbul ignore next */
export function once(el: HTMLElement, event: string, fn: any): void {
  const listener = function (this: any, ...args: unknown[]) {
    if (fn) {
      fn.apply(this, args);
    }
    off(el, event, listener);
  };
  on(el, event, listener);
}

</script>

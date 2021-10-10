/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
declare interface Fn<T = any, R = T> {
  (...arg: T[]): R;
}
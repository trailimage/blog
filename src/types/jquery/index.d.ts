/// <reference types="jquery" />

/**
 * Cannot augment jQuery in the normal way because it's definition is abnormal
 *
 * https://github.com/Microsoft/TypeScript/issues/7148
 */
declare global {
   interface JQueryEventObject {
      targetTouches: TouchList;
   }
}

export {};

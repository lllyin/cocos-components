import { BaseToast, Gravity } from './BaseToast';

interface Options {
  gravity: Gravity;
  textSize: number;
  lineHeight: number;
}

export { Gravity } from './BaseToast';

let toasts: BaseToast[] = [];

export class Toast {
  static readonly LENGTH_SHORT = BaseToast.LENGTH_SHORT;
  static readonly LENGTH_LONG = BaseToast.LENGTH_LONG;

  static defaultOptions: Options = {
    // 位置
    gravity: Gravity.CENTER,
    // 字体大小
    textSize: 14,
    // 行高
    lineHeight: 2,
  };

  static show(
    message: string,
    duration: number = BaseToast.LENGTH_SHORT,
    options: Partial<Options> = Toast.defaultOptions,
  ) {
    const mergeOpts: Options = {
      ...this.defaultOptions,
      ...options,
    };

    const t = BaseToast.makeText(message, duration, null)
      .setGravity(mergeOpts.gravity)
      .setTextSize(mergeOpts.textSize)
      .setLineheight(mergeOpts.lineHeight);

    // 解决第一次toast没有背景色的问题
    toasts.push(t);
    setTimeout(() => {
      toasts.forEach((t) => !t.isDestroy && t.show());
    }, 0);

    return t;
  }

  // 隐藏所有toast
  static hideAll() {
    setTimeout(() => {
      toasts = [];
    }, 0);
  }
}

import { BaseToast, Gravity } from './BaseToast';

interface Options {
  gravity: Gravity;
  textSize: number;
  lineHeight: number;
}

export { Gravity } from './BaseToast';

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

    return BaseToast.makeText(message, duration, null)
      .setGravity(mergeOpts.gravity)
      .setTextSize(mergeOpts.textSize)
      .setLineheight(mergeOpts.lineHeight)
      .show();
  }

  static hide() {}

  static hideAll() {}
}

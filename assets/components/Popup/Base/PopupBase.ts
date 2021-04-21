/**
 *
 * @file PopupBase.ts
 * @author dream
 * @description 弹框UI的父类
 *
 */
import {
  _decorator,
  Component,
  CCBoolean,
  Enum,
  v3,
  tween,
  BlockInputEvents,
  Tween,
  UIOpacity,
  Node,
} from "cc";
import { PopupManager } from "../Manager/PopupManager";
const { ccclass, property, menu } = _decorator;

/**
 * 弹框的动画
 */
export enum AnimType {
  SCALE,
  FADE,
}

/**
 * 默认的缩放动画
 */
const scaleTween: Tween<Node> = tween()
  .to(0.2, { scale: v3(1.1, 1.1, 1) })
  .to(0.05, { scale: v3(1, 1, 1) });
/**
 * 默认的渐现动画
 */
const fadeTween: Tween<UIOpacity> = tween().to(0.25, { opacity: 255 });

@ccclass("PopupBase")
@menu("components/Popup/PopupBase")
export class PopupBase extends Component {
  /**
   * 是否设置点击拦截
   */
  @property(CCBoolean)
  blockInput: boolean = true;

  /**
   * 是否显示弹框动画
   */
  @property(CCBoolean)
  anim: boolean = true;

  /**
   * 弹框动画类型
   */
  @property({
    type: Enum(AnimType),
    visible() {
      return (this as any).anim;
    },
  })
  animType: AnimType = AnimType.SCALE;

  private _popupName: string = "";
  /**
   * 弹框的名字 如果没有自定义命名，则名字为prefab的名字
   */
  get popupName() {
    return this._popupName;
  }

  onLoad() {
    if (this.blockInput) {
      this.node.addComponent(BlockInputEvents);
    }
  }

  _init(name: string, params: any) {
    this._popupName = name;
    this.init(params);
  }

  /**
   * 第一次创建将会在onLoad之前创建，后续将会在onEnable之前执行
   * @param data 传入数据
   */
  init(data: any) {}

  _show(): Promise<void> {
    this.node.active = true;
    return new Promise((resolve, reject) => {
      if (this.anim) {
        if (AnimType.FADE == this.animType) {
          let uiOpacity = this.node.getComponent(UIOpacity);
          if (null == uiOpacity) {
            uiOpacity = this.node.addComponent(UIOpacity);
          }
          uiOpacity.opacity = 0;
          fadeTween.clone(uiOpacity).call(() => {
            this.onShow();
            resolve();
          });
        } else if (AnimType.SCALE === this.animType) {
          this.node.scale = v3(0, 0, 1);
          scaleTween
            .clone(this.node)
            .call(() => {
              this.onShow();
              resolve();
            })
            .start();
        } else {
          this.onShow();
          resolve();
        }
      } else {
        this.onShow();
        resolve();
      }
    });
  }

  /**
   * 动画播放完后显示，onEnable之后执行
   */
  onShow() {}

  _hide() {
    this.onHide();
    this.node.active = false;
  }

  /**
   * 在onDisEnable之前执行
   */
  onHide() {}

  _remove() {
    this.node.destroy();
  }

  /**
   * 隐藏该UI
   */
  hideUI() {
    PopupManager.instance.hide(this.popupName);
    this.node.emit("hide");
  }

  /**
   * 移除该UI
   */
  removeUI() {
    PopupManager.instance.remove(this.popupName);
    this.node.emit("remove");
  }
}

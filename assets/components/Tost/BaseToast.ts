/**
 *
 * @file Toast.ts
 * @author dream
 * @description 模拟吐司效果
 *
 */

import {
  BlockInputEvents,
  Canvas,
  color,
  director,
  ImageAsset,
  Label,
  Layers,
  Node,
  Sprite,
  SpriteFrame,
  Texture2D,
  tween,
  UIOpacity,
  UITransform,
  v3,
  view,
} from 'cc';

/**
 * 位置
 */
export enum Gravity {
  // 底部
  BOTTOM,
  // 居中
  CENTER,
  // 顶部
  TOP,
}

export class BaseToast {
  static readonly LENGTH_SHORT: number = 2; // 短时间吐司
  static readonly LENGTH_LONG: number = 3.5; // 长时间吐司

  private static pNode: Node | null = null;
  private bgNode: Node;
  private textNode: Node;

  private node: Node;
  private text: string = '';
  private time: number = BaseToast.LENGTH_SHORT;
  private textSize: number = 14;
  private lineHeight: number = 2;
  private gravity: Gravity = Gravity.TOP;

  private constructor(node: Node | null) {
    if (null == node) {
      this.node = this.getPNode();
    } else {
      this.node = node;
    }

    this.bgNode = new Node();
    this.bgNode.layer = Layers.Enum.UI_2D;
    this.bgNode.addComponent(BlockInputEvents);
    let sprite = this.bgNode.addComponent(Sprite);
    sprite.type = Sprite.Type.SLICED;
    let imageObj = new Image();
    imageObj.src =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACAQMAAABIeJ9nAAAAA1BMVEX///+nxBvIAAAACklEQVQI12MAAgAABAABINItbwAAAABJRU5ErkJggg==';
    let textureObj = new Texture2D();
    textureObj.image = new ImageAsset(imageObj);
    let sf = new SpriteFrame();
    sf.texture = textureObj;
    sprite.spriteFrame = sf;
    sprite.color = color(0, 0, 0, 200);
    this.bgNode.active = false;

    this.textNode = new Node('Text');
    this.textNode.layer = Layers.Enum.UI_2D;
    let uiTransform = this.textNode.addComponent(UITransform);
    uiTransform.width = this.node.getComponent(UITransform)!.width;
    let label = this.textNode.addComponent(Label);
    label.horizontalAlign = Label.HorizontalAlign.CENTER;
    label.verticalAlign = Label.VerticalAlign.CENTER;

    this.textNode.parent = this.bgNode;
    this.bgNode.parent = this.node;
  }

  /**
   * 生成吐司
   * @param node
   * @param text
   * @param time
   * @returns
   */
  static makeText(text: string, time: number, node: Node | null) {
    let toast = new BaseToast(node);
    toast.text = text;
    toast.time = time;

    return toast;
  }

  /**
   * 显示吐司
   */
  show() {
    this.setText(this.text).setTextSize(this.textSize).setOverFlow();
    this.bgNode.active = true;
    let uiOpacity = this.bgNode.getComponent(UIOpacity);

    if (null == uiOpacity) {
      uiOpacity = this.bgNode.addComponent(UIOpacity);
    }
    tween(uiOpacity)
      .delay(this.time)
      .to(0.3, { opacity: 0 })
      .call(() => {
        this.bgNode.active = false;
        this.bgNode.destroy();
      })
      .start();
  }

  /**
   * 设置文字
   * @param text 文字
   * @returns
   */
  setText(text: string): BaseToast {
    this.text = text;
    let label = this.textNode.getComponent(Label)!;
    label.string = this.text;
    return this;
  }

  /**
   * 设置文字大小
   * @param textSize 文字大小
   * @returns
   */
  setTextSize(textSize: number): BaseToast {
    this.textSize = textSize;
    let label = this.textNode.getComponent(Label)!;
    label.fontSize = this.textSize;
    return this;
  }

  // 设置行高
  setLineheight(lineHeight: number) {
    this.lineHeight = lineHeight;
    return this;
  }

  /**
   * 设置时间
   * @param time 时间
   * @returns
   */
  setTime(time: number) {
    this.time = time;
    return this;
  }

  /**
   * 设置位置
   * @param gravity 位置
   * @returns
   */
  setGravity(gravity: Gravity): BaseToast {
    this.gravity = gravity;
    return this;
  }

  private setPosition() {
    let uiTransform = this.node.getComponent(UITransform)!;
    let bgUITransform = this.bgNode.getComponent(UITransform)!;

    switch (this.gravity) {
      case Gravity.BOTTOM: {
        const y = -uiTransform.height / 2 + bgUITransform.height / 2 + 64;

        this.bgNode.position = v3(0, y, 0);
        break;
      }
      case Gravity.CENTER: {
        const x = -bgUITransform.width / 2;
        const y = -bgUITransform.height / 2;

        this.bgNode.position = v3(0, 0, 0);
        break;
      }
      case Gravity.TOP: {
        const y = uiTransform.height / 2 - bgUITransform.height / 2 - 64;

        this.bgNode.position = v3(0, y, 0);
        break;
      }
    }
  }

  private setOverFlow() {
    let maxLength = this.node.getComponent(UITransform)!.width / 2;
    let label = this.textNode.getComponent(Label)!;
    let fontLength = this.text.length * label.fontSize;
    let uiTransform = this.textNode.getComponent(UITransform)!;

    if (fontLength > maxLength) {
      uiTransform.width = maxLength;
      label.overflow = Label.Overflow.RESIZE_HEIGHT;
    } else {
      uiTransform.width = fontLength;
      label.overflow = Label.Overflow.NONE;
    }
    let bgUITransform = this.bgNode.getComponent(UITransform)!;
    bgUITransform.width = uiTransform.width + label.fontSize * 4;
    bgUITransform.height = label.fontSize * this.lineHeight;
    this.setPosition();
  }

  private getPNode(): Node {
    if (null == BaseToast.pNode || !BaseToast.pNode.isValid) {
      BaseToast.pNode = new Node('Toast');
      let transform = BaseToast.pNode.addComponent(UITransform);
      BaseToast.pNode.layer = Layers.Enum.UI_2D;
      BaseToast.pNode.addComponent(Canvas);
      director.getScene()?.addChild(BaseToast.pNode);
      let size = view.getVisibleSize();
      transform.contentSize = size;
      transform.width = size.width;
      transform.height = size.height;
      BaseToast.pNode.position = v3(size.width / 2, size.height / 2, 0);
    }
    return BaseToast.pNode;
  }
}

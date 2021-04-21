import {
  _decorator,
  Component,
  Node,
  Mask,
  CCString,
  color,
  Label,
  Sprite,
  SpriteFrame,
  director,
  resources,
  Vec3,
  Layers,
  UITransform,
  math,
  CCInteger,
  Overflow,
} from 'cc';
const { ccclass, property, menu } = _decorator;

import { RoundRectMask } from '../RoundRectMask/RoundRectMask';

// 徽标位置
export enum Position {
  // 左上角
  TOP_LEFT = 0,
  // 右上角
  TOP_RIGHT = 1,
}

const defaultSprite = 'default/default_sprite_splash/spriteFrame';

@ccclass('Badge')
@menu('components/Badge')
export class Badge extends Component {
  @property({ type: CCString, tooltip: '徽标默认内容' })
  propText: string = '6';
  @property({ type: CCInteger, tooltip: '宽' })
  width: number = 30;
  @property({ type: CCInteger, tooltip: '高' })
  height: number = 26;
  @property({ type: CCInteger, tooltip: '圆角' })
  radius: number = 6;
  @property({ type: CCInteger, tooltip: '位置\n 0: 左上角 \n 1: 右上角' })
  position: Position = Position.TOP_LEFT;
  // 徽标位置
  public static POSITION: Position;

  private badgeNode: Node = null!;
  private color = color(214, 30, 30, 240);
  private textColor = color(255, 255, 255, 255);
  private labelNode: Node = null!;

  public get text(): string {
    return this.propText;
  }

  public set text(text: string) {
    this.propText = text;
    this.setText(text);
  }

  onLoad() {
    this.initBadge();
  }

  // 初始化badge，插入节点等操作
  initBadge() {
    const badgeNode = this.createBadge();

    this.node.addChild(badgeNode);
    console.log('badgeNode:', badgeNode);
  }

  // 设置位置
  setPosition(position: Position) {
    const parentSize = this.node.getComponent(UITransform)?.contentSize as math.Size;
    const badgeSize = this.badgeNode.getComponent(UITransform)?.contentSize as math.Size;

    switch (position) {
      case Position.TOP_LEFT: {
        const x = -parentSize.width / 2;
        const y = parentSize.height / 2;

        this.badgeNode.setPosition(new Vec3(x, y, 0));
        break;
      }
      case Position.TOP_RIGHT: {
        const x = parentSize.width / 2;
        const y = parentSize.height / 2;

        this.badgeNode.setPosition(new Vec3(x, y, 0));
        break;
      }
    }
  }

  // 设置文字
  setText(text: string) {
    this.text = text;
    const label = this.labelNode.getComponent(Label);

    if (label) {
      label.string = this.text;
      label.color = this.textColor;
    }
    return this;
  }

  createBadge() {
    this.badgeNode = new Node('BadgeNode');
    const backgroundNode = new Node('backgroundNode');
    this.labelNode = new Node('labelNode');

    this.badgeNode.layer = Layers.Enum.UI_2D;
    backgroundNode.layer = Layers.Enum.UI_2D;
    this.labelNode.layer = Layers.Enum.UI_2D;

    // 设置mask
    this.badgeNode.addComponent(Mask);
    this.badgeNode.addComponent(RoundRectMask).radius = this.radius;
    this.badgeNode.getComponent(UITransform)?.setContentSize(this.width, this.height);
    this.badgeNode.active = true;

    // 设置背景
    resources.load(defaultSprite, SpriteFrame, (err, spriteFrame) => {
      if (err) {
        console.warn('加载资源报错:', err);
        return;
      }
      const _sprite = backgroundNode.addComponent(Sprite);

      _sprite.type = Sprite.Type.SIMPLE;
      _sprite.color = this.color;
      _sprite.spriteFrame = spriteFrame;

      backgroundNode.getComponent(UITransform)?.setContentSize(this.width, this.height);
    });

    // 设置label信息
    const _label = this.labelNode.addComponent(Label);
    _label.getComponent(UITransform)?.setContentSize(this.width, this.height);
    _label.string = this.text;
    _label.color = this.textColor;
    _label.fontSize = 14;
    _label.lineHeight = 0;
    _label.overflow = Overflow.SHRINK;
    _label.enableWrapText = false;

    // 添加节点
    this.badgeNode.addChild(backgroundNode);
    this.badgeNode.addChild(this.labelNode);
    this.setPosition(this.position);

    return this.badgeNode;
  }

  start() {}
}

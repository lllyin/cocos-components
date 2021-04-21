/**
 *
 * @file PopupManager.ts
 * @author dream
 * @description 弹框管理类
 *
 */

import { Widget } from "cc";
import {
  BlockInputEvents,
  Canvas,
  director,
  game,
  instantiate,
  Layers,
  Node,
  Prefab,
  UITransform,
  v3,
  view,
} from "cc";
import { PopupBase } from "../Base/PopupBase";
import { CCUtil } from "../util/CCUtil";

// 弹窗显示类型
export enum ShowType {
  // 新弹窗替换旧弹窗
  replace = "replace",
  // 弹窗依次显示，依次消失
  push = "push",
  // 上一个弹窗和新弹窗同时存在
  keep = "keep",
}
export class PopupManager {
  private static _instance: PopupManager;
  public static get instance() {
    if (null == this._instance) {
      this._instance = new PopupManager();
    }
    return this._instance;
  }

  private popupNode: Node | null = null;
  public blockInputNode: Node | null = null;
  private popups: Array<string>;
  private nodes: Map<string, Node>;
  private paths: Map<string, string>;
  private popupInit: boolean = false;

  static ShowType = ShowType;

  private constructor() {
    this.popups = new Array();
    this.nodes = new Map();
    this.paths = new Map();
  }

  /**
   * 初始化
   * 主要实例化父节点
   */
  init() {
    this.setParent();
  }

  // 获取顶层容器节点
  getRoot() {
    const canvas = director.getScene()?.getComponentInChildren(Canvas);
    if (canvas) {
      return canvas.node;
    } else {
      director.getScene();
    }
  }

  /**
   * 预加载Prefab，提前实例化
   * @param option  {name: 自定义名字 prafab: Prefab url: 动态加载的prefab的名字}
   * @returns
   */
  preLoad(option: { name?: string; prefab?: Prefab; url?: string }) {
    let name =
      option.name ||
      option.prefab?.data._name ||
      this.getNameByPath(option.url);
    if (null != name && null != this.nodes.get(name)) {
      console.warn(`${name}已经预加载了`);
      return;
    }
    if (null != option.prefab) {
      let node = instantiate(option.prefab);
      this.nodes.set(name, node);
      return;
    }
    if (null != option.url) {
      CCUtil.load({
        paths: option.url,
        type: Prefab,
        onComplete: (err: Error | null, prefab: Prefab) => {
          if (err) {
            console.error(`${option.url}加载失败`);
            return;
          }
          this.setNameByPath(option.url!, prefab.data._name);
          if (null == name) {
            name = prefab.data._name;
          }
          let node = instantiate(prefab);
          this.nodes.set(name, node);
        },
      });
    }
  }

  /**
   * 显示弹框
   * @param option {name:自定义弹框名字 prefab:Prefab path: 动态加载的路径 priority:层级 params: 传递参数 keep: 正在显示的弹框是否保留}
   */
  show(option: {
    name?: string;
    prefab?: Prefab;
    path?: string;
    priority?: number;
    params?: any;
    /**
     * 弹窗显示方式
     *
     * @type {ShowType}
     */
    showType?: ShowType;
  }) {
    if (!this.popupInit) {
      throw new Error("请先初始化UIManager");
    }
    // 如果需要一个prefab对应两个弹框，则名字需要自行定义
    let name =
      option.name ||
      option.prefab?.data._name ||
      this.getNameByPath(option.path);
    if (null == name && null == option.path) {
      throw new Error("name、prefab、path不同同时为空");
    }
    // 弹框过程中，背景不可以点击
    this.blockInputNode!.active = true;
    let priority = option.priority || 0;
    let node: Node | undefined;
    if (null != name) {
      node = this.nodes.get(name);
    }
    if (null == node) {
      if (null == option.prefab) {
        if (null == option.path) {
          this.blockInputNode!.active = false;
          throw new Error("首次创建必须传入prefab或者path");
        }
        CCUtil.load({
          paths: option.path,
          type: Prefab,
          onComplete: (err: Error | null, prefab: Prefab) => {
            if (err) {
              console.error(`${option.path}加载失败`);
              this.blockInputNode!.active = false;
              return;
            }
            this.setNameByPath(option.path!, prefab.data._name);
            if (null == name) {
              name = prefab.data._name;
            }
            node = instantiate(prefab);
            this.nodes.set(name, node);
            this._show(
              name,
              node,
              priority,
              option.params,
              option.showType || ShowType.replace
            );
          },
        });
        return;
      }
      node = instantiate(option.prefab);
      this.nodes.set(name, node);
      this._show(
        name,
        node,
        priority,
        option.params,
        option.showType || ShowType.replace
      );
    } else {
      this._show(
        name,
        node,
        priority,
        option.params,
        option.showType || ShowType.replace
      );
    }
  }

  private _show(
    name: string,
    node: Node,
    priority: number,
    params: any,
    showType: ShowType
  ) {
    // 层级高的优先显示
    let curPriority =
      this.getCurrentPopup()?.getComponent(UITransform)?.priority || 0;
    if (priority < curPriority) {
      node.active = false;
      for (let i = 0; i <= this.popups.length - 1; i++) {
        let tempNode = this.nodes.get(this.popups[i]);
        if (priority <= (tempNode!.getComponent(UITransform)?.priority || 0)) {
          this.popups.splice(i, 0, name);
          break;
        }
      }
    } else {
      switch (showType) {
        case ShowType.push: {
          this._hideAll();
          let idx = this.popups.indexOf(name);
          if (idx >= 0) {
            this.popups.splice(idx, 1);
          }
          this.popups.push(name);
          break;
        }
        case ShowType.keep: {
          break;
        }
        case ShowType.replace:
        default: {
          this._hideAll();
          this.popups.pop();
          this.popups.push(name);
          break;
        }
      }
    }

    let popup = node.getComponent(PopupBase);
    if (null == popup) {
      this.blockInputNode!.active = false;
      throw new Error("请将Popup继承PopupBase");
    }
    popup._init(name, params);
    if (node.parent != this.popupNode) {
      node.removeFromParent();
      node.parent = this.popupNode;
    }
    let uiTransform = node.getComponent(UITransform);
    if (null == uiTransform) {
      uiTransform = node.addComponent(UITransform);
    }
    if (uiTransform.priority != priority) {
      uiTransform.priority = priority;
    }
    if (priority >= curPriority) {
      popup!._show().then(() => {
        this.blockInputNode!.active = true;
      });
    } else {
      this.blockInputNode!.active = true;
    }
  }

  private showLast() {
    let node: Node | null = null;
    if (this.popups.length > 0) {
      let name = this.popups[this.popups.length - 1];
      node = this.nodes.get(name) || null;
    }
    if (null == node) {
      return;
    }
    if (!node.active) {
      this.blockInputNode!.active = true;
      let ui = node.getComponent(PopupBase)!;
      ui._show().then(() => {
        this.blockInputNode!.active = false;
      });
    }
  }

  /**
   * 隐藏弹框
   * @param name 弹框的名字
   */
  hide(name: string) {
    let idx = this.popups.indexOf(name);
    let isLast = idx === this.popups.length - 1;
    if (idx >= 0) {
      this.popups.splice(idx, 1);
    }
    this._hideUI(name);
    if (isLast) {
      this.showLast();
    }
    if (this.popups.length === 0) {
      this.blockInputNode!.active = false;
    }
  }

  /**
   * 隐藏所有弹框
   */
  hideAll() {
    this._hideAll();
    this.popups.length = 0;
  }

  _hideAll() {
    for (let i = 0; i < this.popups.length; i++) {
      this._hideUI(this.popups[i]);
    }
  }

  private _hideUI(name: string) {
    let node = this.nodes.get(name);
    if (null == node) {
      console.warn(`${name}已被销毁`);
      return;
    }
    let ui = node.getComponent(PopupBase);
    ui!._hide();
  }

  /**
   * 移除弹框
   * @param name 弹框名字
   * @returns
   */
  remove(name: string) {
    this.hide(name);
    let node = this.nodes.get(name);
    if (null == node) {
      return;
    }
    this.nodes.delete(name);
    let ui = node.getComponent(PopupBase);
    ui!._remove();
  }

  /**
   * 移除弹框
   */
  removeAll() {
    this.hideAll();
    for (let name in this.nodes) {
      this.remove(name);
    }
  }

  /**
   * 获取当前弹框
   * @returns 弹框Node，如果当前没有弹框，返回null
   */
  getCurrentPopup(): Node | null {
    let name = this.getCurrentName();
    if (null == name) {
      return null;
    }
    return this.nodes.get(name) || null;
  }

  /**
   * 获取当前弹框的名字
   * @returns 弹框名字，如果当前没有弹框，则返回null
   */
  getCurrentName(): string | null {
    if (this.popups.length > 0) {
      return this.popups[this.popups.length - 1];
    }
    return null;
  }

  /**
   * 根据弹框名，获取弹框Node
   * @param name 弹框名
   * @returns 弹框Node,如果没有对应的弹框，则返回null
   */
  getPopup(name: string): Node | null {
    return this.nodes.get(name) || null;
  }

  private setNameByPath(path: string, name: string) {
    if (null == this.getNameByPath(path)) {
      this.paths.set(path, name);
    }
  }

  private getNameByPath(
    path: string | null | undefined
  ): string | null | undefined {
    if (null == path) {
      return null;
    }
    return this.paths.get(path);
  }

  private setParent() {
    if (this.popupInit) {
      throw new Error("PopupManager已经初始化了");
    }
    this.popupNode = new Node("Popup");
    this.popupNode.layer = Layers.Enum.UI_2D;
    this.popupNode.addComponent(Canvas);
    director.getScene()?.addChild(this.popupNode);
    game.addPersistRootNode(this.popupNode);
    let size = view.getVisibleSize();
    let transform = this.popupNode.addComponent(UITransform);
    transform.contentSize = size;
    this.popupNode.position = v3(size.width / 2, size.height / 2, 0);
    this.popupInit = true;

    this.blockInputNode = this.setBlockInput();
  }

  private setBlockInput() {
    const blockInputNode = new Node("BlockInput");
    const uiTranform = blockInputNode.addComponent(UITransform);
    const widgt = blockInputNode.addComponent(Widget);
    const size = view.getVisibleSize();

    blockInputNode.addComponent(BlockInputEvents);
    blockInputNode.layer = Layers.Enum.UI_2D;
    blockInputNode.active = false;

    widgt.left = 0;
    widgt.right = 0;
    widgt.top = 0;
    widgt.bottom = 0;

    uiTranform.setContentSize(size);
    // uiTranform.priority = 99999;

    this.getRoot()?.addChild(blockInputNode);

    return blockInputNode;
  }
}

import { _decorator, Component, Prefab } from 'cc';

import { PopupManager } from '../../../Popup/Manager/PopupManager';
import { Toast, Gravity } from '../../Toast';

const { ccclass, property } = _decorator;

@ccclass('BtnContrl')
export class BtnContrl extends Component {
  @property(Prefab)
  popupPrefab: Prefab = null!;

  start() {}

  onLoad() {
    PopupManager.instance.init();
  }

  showToast() {
    console.log('居中toast button clicked');
    Toast.show('滚滚长江东逝水' + ((Math.random() * 10) >> 0).toString(), Toast.LENGTH_SHORT);
  }

  showTopToast() {
    console.log('顶部toast button clicked');
    Toast.show('滚滚长江东逝水' + ((Math.random() * 10) >> 0).toString(), Toast.LENGTH_SHORT, {
      gravity: Gravity.TOP,
    });
  }

  showBottomToast() {
    console.log('底部toast button clicked');
    Toast.show('滚滚长江东逝水' + ((Math.random() * 10) >> 0).toString(), Toast.LENGTH_SHORT, {
      gravity: Gravity.BOTTOM,
    });
  }

  showModal() {
    // console.log('激活状态：', PopupManager.instance.blockInputNode?.active);
    PopupManager.instance.show({
      priority: 999,
      prefab: this.popupPrefab,
    });
    console.log('modal button clicked:');
  }

  hideModal() {
    PopupManager.instance.hide(this.popupPrefab.data._name);
  }
}

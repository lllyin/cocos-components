/**
 *
 * @file CCUtil.ts
 * @author dream
 * @description Cocos方法整合，如果Cocos版本升级，造成API修改，仅需修改此处
 *
 */

import { Asset, resources, __private } from "cc";

export module CCUtil {

    /**
     * 记载resources目录下的资源
     * @param option {paths: 路径, type: 类型 onProgress: 进度回调 onComplete:完成回调}
     */
    export function load<T extends Asset>(option: {
        paths: string,
        type: __private.cocos_core_asset_manager_shared_AssetType<T> | null,
        onProgress?: __private.cocos_core_asset_manager_shared_ProgressCallback | null,
        onComplete?: __private.cocos_core_asset_manager_shared_CompleteCallbackWithData<T> | null
    }): void {
        resources.load(option.paths, option.type, option.onProgress!, option.onComplete!);
    }
}
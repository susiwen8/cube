# Cube Miniapps Rubik

原生微信小程序与支付宝小程序魔方示例工程，支持 `3 阶` 到 `10 阶`，包含：

- 手势转层与视角拖拽
- 空白区域拖动转视角
- 自动求解回放
- 教学模式
- 计时与本地成绩
- `3-10` 阶切换
- 高阶内层记号，例如 `2R`、`3U`、`4F`

## 目录

- `src/shared/core`：魔方状态、转动、打乱、求解、教程、计时
- `src/shared/render`：投影、命中检测、手势映射、Canvas 绘制
- `src/shared/runtime`：共享运行时，统一动画、播放、视口、交互状态
- `src/shared/adapters`：平台存储、页面会话适配、共享小程序页面运行时
- `apps/h5`：手机优先的 H5 独立站点
- `miniapps/wechat`：微信小程序原生壳
- `miniapps/alipay`：支付宝小程序原生壳

## 当前优化点

- 核心状态、打乱、转动、记录已统一支持 `3-10` 阶
- 自动求解优先走状态搜索，深度不足时再回退到历史逆序
- `3 阶` 保留状态搜索求解，`4-10` 阶默认使用历史回退求解
- 手势层使用贴纸投影轴做方向判定，减少斜视角误判
- 手势选层支持高阶内层拖拽，中心块仍可直接转当前面
- 微信与支付宝共享同一套页面运行时，平台壳只保留 API 差异
- 计时刷新、自动播放、动画插值统一由单循环调度
- `sync:shared` 使用 `esbuild` 生成可直接 `require` 的 CommonJS 运行时副本

## 操作说明

- 拖动贴纸可转动对应层，拖动空白区域可旋转观察视角
- 中心块贴纸仍可直接转当前面，高阶内层使用靠近对应条带的贴纸来选层
- `3 阶` 自动求解优先做状态搜索，`4-10` 阶会根据最近操作自动回退
- 教学模式默认讲解外层公式；高阶内层转动统一用 `2R / 2U / 3F` 这类记号

## 本地测试

```bash
npm test
```

## 运行 H5

安装 H5 依赖：

```bash
npm install --prefix apps/h5
```

启动开发环境：

```bash
npm run dev --prefix apps/h5
```

打包 H5：

```bash
npm run build --prefix apps/h5
```

## 同步共享运行时

共享源码放在 `src/shared`，用于 Node 测试。

双端小程序运行时副本通过下面的命令同步到：

- `miniapps/wechat/shared`
- `miniapps/alipay/shared`

```bash
npm run sync:shared
```

同步后会在 `miniapps/wechat/shared` 和 `miniapps/alipay/shared` 下生成 CommonJS 产物与 `package.json`。

## 打开项目

- 微信开发者工具打开 `miniapps/wechat`
- 支付宝开发者工具打开 `miniapps/alipay`

# Weather Console

[English](README-en.md) | 中文

一个轻量级城市天气查询页面，使用原生 HTML、CSS 和 JavaScript 构建。项目无需打包或安装依赖，直接在浏览器中打开即可使用。

## 功能特点

- 支持按城市名称查询实时天气。
- 展示温度、湿度、风速、体感温度和更新时间。
- 根据天气状态切换页面主题与天气图标。
- 自动保存最近搜索城市，方便快速再次查询。
- 适配桌面端和移动端布局。

## 技术栈

- HTML5
- CSS3
- JavaScript
- Open-Meteo Geocoding API
- Open-Meteo Forecast API

## 项目结构

```text
weather-app/
├── index.html      # 页面结构
├── style.css       # 页面样式与响应式布局
├── script.js       # 天气查询、渲染和最近搜索逻辑
├── .gitignore      # Git 忽略规则
├── README-cn.md    # 中文项目说明文档
└── README-en.md    # 英文项目说明文档
```

## 本地运行

方式一：直接打开文件

```text
双击 index.html
```

方式二：使用本地静态服务器

```powershell
python -m http.server 5500
```

然后在浏览器访问：

```text
http://localhost:5500
```

## 使用说明

1. 在搜索框中输入城市名称，例如 `Beijing`、`Shanghai`、`Tokyo`。
2. 点击 `Search` 按钮。
3. 页面会展示当前天气数据，并记录最近搜索城市。

## 数据来源

本项目使用 Open-Meteo 提供的免费接口：

- 城市地理编码：`https://geocoding-api.open-meteo.com/v1/search`
- 实时天气数据：`https://api.open-meteo.com/v1/forecast`

接口请求在浏览器端直接发起，不需要后端服务或 API Key。

## 注意事项

- 需要联网才能查询实时天气。
- 城市搜索结果取接口返回的第一个匹配项。
- 最近搜索记录保存在浏览器 `localStorage` 中，清除浏览器数据后会消失。

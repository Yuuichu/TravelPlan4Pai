# TravelPlan4Pai

给圆周旅记使用的纯文本旅游攻略生成器。

## 功能

- 输入精确到年月日的游玩日期范围
- 输入游玩偏好、同行人数、必去地点和避雷点
- 在浏览器 localStorage 保存 DeepSeek API Key、模型名和个人人设
- 调用 DeepSeek Chat Completions API 生成可直接粘贴到圆周旅记的纯文本攻略
- 按半天 4 小时规划每日行程，并要求输出主方案、备份方案、删减顺序和富余时间方案

## 本地预览

```bash
python -m http.server 4173
```

然后访问 `http://localhost:4173`。

## GitHub Pages 部署

这是纯静态项目，可直接部署到 GitHub Pages：

1. 推送到 `main` 分支。
2. 打开 GitHub 仓库 Settings → Pages。
3. Source 选择 `Deploy from a branch`。
4. Branch 选择 `main`，目录选择 `/ (root)`。
5. 保存后等待 GitHub Pages 构建完成。

## 隐私说明

API Key 只保存在当前浏览器的 localStorage 中。项目没有后端，也不会把 API Key 存到服务器。

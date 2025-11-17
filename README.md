<img width="345" height="156" alt="image" src="https://github.com/user-attachments/assets/aae42a9c-7f50-496c-ab81-419bed79f1f1" />## Bytebase 风格 GitHub 登录页（前端）

这是一个使用 **React + Create React App** 实现的 Bytebase 风格登录页面 UI，提供：

- **左侧大图登录宣传区域**：`public/login.png` 全屏铺满左侧。
- **右侧登录卡片**：GitHub 登录按钮 + 登录后展示 GitHub 用户头像、昵称、login、邮箱。
- **GitHub 授权登录流程**：点击按钮跳转 GitHub 授权，授权成功后回到本页面并显示用户信息。
- **退出登录 / 切换账号**：支持清除后端 session 并重新发起授权。

> 后端 Spring Boot 工程为同级目录下的 `GitHubOAuth` 项目。


---
登录前页面：
![登录前效果](https://github.com/TABSHUOC/bytebase-login-frontend/blob/main/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE%202025-11-17%20132157.png)。
登录后页面：
![登录后效果](https://github.com/TABSHUOC/bytebase-login-frontend/blob/main/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE%202025-11-17%20132143.png)
---

## 技术栈

- React 19 + Create React App
- 原生 CSS 布局 / 响应式适配
- 与 Spring Boot 后端通过 HTTP 交互（CORS + Cookie）

---

## 目录结构（前端）

- `src/App.js`：主页面组件，包含 GitHub 登录按钮、用户信息展示逻辑。
- `src/App.css`：Bytebase 风格布局与样式。
- `public/login.png`：登录页面左侧展示的大图（需自行放置）。
- `package.json`：依赖与 `proxy` 配置（开发环境将 `/api` 转发到后端）。

---

## 运行前置条件

- Node.js 环境（建议 18+）
- 已经启动后端 `GitHubOAuth` Spring Boot 服务，默认监听 `http://localhost:4000`
- 后端已正确配置 GitHub OAuth（见后端 README）

---

## 本地运行

在 `login-page` 目录下：

```bash
npm install
npm start
```

开发环境默认地址：<http://localhost:3000>

`package.json` 中已配置：

```json
"proxy": "http://localhost:4000"
```

因此前端访问 `/api/...` 会转发到后端 4000 端口。

---

## GitHub 登录流程说明

1. 用户访问 `http://localhost:3000`。
2. 点击 **Continue with GitHub** 按钮：
   - 前端跳转到：`http://localhost:4000/api/auth/github/login`
3. 后端重定向到 GitHub 授权页。
4. 授权成功后：
   - GitHub 回调后端 `/api/auth/github/callback?code=...`
   - 后端用 code 换取 access_token，并从 GitHub 获取用户信息；
   - 将用户信息保存到 session，重定向回前端：`http://localhost:3000/?login=success`。
5. 前端检测到 URL 中 `login=success`，调用：`GET http://localhost:4000/api/auth/me` 获取当前用户信息并展示。

退出登录：

- 右侧卡片上的“退出登录 / 切换账号”按钮会调用：

  ```http
  POST http://localhost:4000/api/auth/logout
  ```

  后端清除 session，前端本地状态也会被清空，下次需要重新点击 GitHub 登录。

---

## 打包构建

```bash
npm run build
```

生成的静态资源会输出到 `build/` 目录，可部署到任意静态服务器（需同时部署/代理后端 API）。


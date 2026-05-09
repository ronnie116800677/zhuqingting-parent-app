# 竹蜻蜓教育 · 家长成长记录小 App

这是一个 React + Vite 手机端网页 App 原型，数据暂时保存在浏览器 localStorage，适合本地演示和测试。

## 本地测试账号

- 老师后台密码：`zqt2026`
- 家长查询码：`CYR2026`、`LXM2026`

## Windows 运行步骤

1. 安装 Node.js
   - 打开浏览器访问：https://nodejs.org/
   - 下载并安装 LTS 版本。
   - 安装时一路点 Next，确认勾选 `npm package manager`。

2. 打开项目文件夹
   - 进入这个文件夹：`C:\Users\ronni\Documents\Codex\2026-05-09\app-react-vite-app-1-2`
   - 在空白处按住 Shift，再点鼠标右键。
   - 选择“在终端中打开”或“在 PowerShell 中打开”。

3. 安装依赖

   ```powershell
   npm install
   ```

4. 启动项目

   ```powershell
   npm run dev
   ```

5. 打开网页
   - 终端里会出现类似 `http://localhost:5173/` 的地址。
   - 按住 Ctrl 点击这个地址，或复制到浏览器打开。

6. 打包上线文件

   ```powershell
   npm run build
   ```

   打包完成后，`dist` 文件夹就是可以部署的静态网页文件。

## 完整项目结构

```text
app-react-vite-app-1-2/
├─ index.html
├─ package.json
├─ start-windows.bat
├─ vite.config.js
├─ README.md
└─ src/
   ├─ main.jsx
   ├─ App.jsx
   └─ styles.css
```

## 不想敲命令的方式

安装 Node.js 后，也可以直接双击 `start-windows.bat`。它会自动安装依赖并启动项目。

## 后续升级成真正上线版本

现在项目已经支持 Supabase 云端数据。没有配置 Supabase 时，会自动使用 localStorage；配置后，老师和家长在不同设备打开同一个网址，就能看到同一份数据。

### 第一步：在 Supabase 建数据表

1. 打开 Supabase，进入你创建好的项目。
2. 左侧找到 `SQL Editor`。
3. 新建一个 SQL 查询。
4. 打开项目里的 `supabase-schema.sql`。
5. 把里面的全部内容复制进去。
6. 点击 `Run`。

### 第二步：复制 Supabase 配置

1. 在 Supabase 左侧进入 `Project Settings`。
2. 找到 `API`。
3. 复制 `Project URL`。
4. 复制 `anon public` key。
5. 在项目根目录新建 `.env.local` 文件。
6. 按下面格式填写：

```text
VITE_SUPABASE_URL=这里粘贴 Project URL
VITE_SUPABASE_ANON_KEY=这里粘贴 anon public key
```

注意：不要使用 `service_role` key。只能填写 `anon public` key。

### 第三步：重新启动本地项目

关闭原来的启动窗口，重新运行：

```powershell
npm run dev
```

如果页面顶部显示“当前使用云端数据，多设备可同步查看。”，说明连接成功。

### 第四步：部署到 Vercel

1. 把项目上传到 GitHub。
2. 打开 Vercel。
3. 点击 `Add New Project`。
4. 选择这个 GitHub 项目。
5. Framework Preset 选 `Vite`。
6. 在 Environment Variables 里添加：

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

7. 点击 Deploy。

部署成功后，Vercel 会给你一个 HTTPS 网址。老师和家长以后都打开这个网址。

### 真正商用前还要补强

当前 Supabase 规则是为了快速演示，方便老师端直接写入数据。真正上线商用前，还需要：

1. 增加正式老师登录，不把后台密码放在前端代码里。
2. 使用 Supabase Auth 或独立后端接口控制权限。
3. 家长用手机号、验证码或专属链接登录。
4. 数据库规则改成“老师可管理全部，家长只能读取自己孩子”。
5. 增加备份、操作日志、隐私协议和数据导出。

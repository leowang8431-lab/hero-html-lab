Hero Home · 英雄之家
HTML 期末项目 / 2026
=================================================

一、如何打开

解压整个文件夹，双击 index.html 即可使用。
请保持 index.html、其余 HTML 文件和 assets 文件夹的相对位置。
本项目没有第三方前端依赖，不需要 npm install，也不需要构建。
导航、名言和游戏需要浏览器允许 JavaScript。

用 VS Code 打开整个 hero-academy 文件夹可以查看、编辑源码。
也可以在本文件夹的终端运行 python -m http.server 8000，
再用浏览器访问 http://localhost:8000。

二、页面

全站界面和页面内容均为英文，采用示例网站的简洁居中布局，支持日夜模式。

index.html     首页：人物横幅、网站简介、各页面入口。
quotes.html    名言页：18 条古典名言的英文译文，横幅每次加载随机选句，
               按钮避免连续重复，并支持分类、搜索、收藏及复制。
projects.html  项目页：6 个项目构想，以有序列表展示说明与功能。
machine.html   游戏页：8 张卡牌 / 4 对角色，含计时、步数与最佳成绩。

三、主要代码

assets/css/style.css  四页共用的样式与移动端适配。
assets/js/app.js      唯一的导航与页脚模板（DRY），日夜开关及当前页状态。
assets/js/theme.js    首次绘制前读取主题选择，减少跨页切换时的闪烁。
assets/js/quotes.js   名言数据、随机展示、筛选、搜索与收藏逻辑。
assets/js/game.js     Fisher–Yates 洗牌、翻牌判断、重开与成绩保存。
assets/images/        人物透明素材与原创代码图标 favicon.svg。

收藏和游戏纪录保存在当前浏览器的 localStorage；清除浏览器数据会清除纪录。
当浏览器不允许存储时，页面仍可运行，收藏与最佳成绩仅在当前会话可用。

四、可修改内容

页面标题与正文：对应 HTML 文件。
名言：quotes.js 文件顶部 quotes 数组。
角色名字与图片：game.js 文件顶部 characters 数组。
主题颜色：style.css 顶部 :root 变量。

五、VS Code AI 助手

项目已经提供 .vscode/extensions.json，推荐 OpenAI Codex 扩展。
仅提供推荐配置不代表扩展已经安装或已登录。
本次尝试通过 VS Code 命令行安装，但扩展市场连接未完成，因此未标记安装成功。
在 VS Code 扩展页面搜索 OpenAI Codex，确认发布者为 OpenAI，安装后登录。
随后选中本文件夹，发送例如“解释 app.js 如何实现复用导航”。
截图扩展已安装状态及一次成功交互，作为课程第 7 项的证据。
官方说明：https://learn.chatgpt.com/docs/codex/ide

六、GitHub 提交

本地已执行 git init，提交/远程连接的最终状态见“提交检查清单.txt”。
当前 Sites 托管远程与课程要求的个人 GitHub 仓库是两个不同的仓库。
如果没有个人 GitHub 仓库，在 GitHub 新建空仓库 hero-html-lab，
不要自动生成 README、许可证或 .gitignore。
创建入口：https://github.com/new?name=hero-html-lab

原始工作区的网站文件夹已 Git 初始化并保存提交历史。
下载的源码 ZIP 不含 .git、dist 和临时文件，解压后可用附带的脚本初始化并推送：

  .\connect-github.ps1 -RepositoryUrl https://github.com/YOUR_USERNAME/hero-html-lab.git

该脚本只使用你提供的地址，不自动创建仓库、不覆盖其他远程地址，也不强制推送。
也可按下面的手动命令操作；若解压后的文件夹没有 .git，先执行
git init -b main、git add . 和 git commit -m "Complete Hero Home website"。

在本文件夹打开终端，将下面地址换成你自己新建仓库的真实地址：

  git remote add github https://github.com/YOUR_USERNAME/hero-html-lab.git
  git push -u github main

如需指定作者，先运行：
  git config user.name "你的GitHub用户名"
  git config user.email "你的GitHub已验证邮箱或noreply邮箱"

如果已有 origin 且老师要求它指向 GitHub，可先用 git remote -v 核实，再重命名后添加：
  git remote rename origin sites
  git remote add origin https://github.com/YOUR_USERNAME/hero-html-lab.git
  git push -u origin main

网页项目不需要 GitHub 令牌才能运行。推送时通过 Git 的浏览器登录完成认证。
不要将密码、令牌或私人账号凭据写入源码。

七、提交建议

提交整个源码文件夹或 ZIP，以及 GitHub 仓库地址。
补充自己的姓名、学号与课程信息（此项目没有代填个人信息）。
建议准备：首页 / 名言页 / 6 个项目列表 / 游戏胜利画面、
VS Code AI 助手已安装且能交互、GitHub 仓库代码页与提交记录的截图。
人物来自用户提供的截图，网站仅使用分离的人物素材。
四张素材均为透明 PNG；被遮挡或带叠加文字的部分通过裁剪避开，没有补画人物。
本项目为课程学习作品。

八、托管

prepare-dist.mjs 仅用于复制静态页面到 dist/ 供托管，不影响本地双击使用。
.openai/hosting.json 保存 Sites 托管项目配置，不包含密码或访问令牌。
默认 Sites 发布仅创建者可访问；如老师需要查看，需另外提供本地 ZIP、
GitHub 链接，或由创建者调整托管访问设置。

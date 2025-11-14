# Regex Test Preview

一个用于测试和预览正则表达式的VSCode插件，支持**自动实时高亮显示**匹配结果。参考了 [JetBrains Regexp Tester](https://plugins.jetbrains.com/plugin/2917-regexp-tester) 的设计理念。

## ✨ 核心特性

- 🎯 **自动实时匹配** - 输入正则表达式和文本，自动显示高亮匹配结果
- 🎨 **文本高亮显示** - 匹配的文本以蓝色背景高亮，清晰直观
- ⚡ **无需按钮操作** - 移除了多余的测试按钮，输入即匹配
- 🔄 **Canvas背景技术** - 使用Canvas绘制高亮背景，彻底解决文字叠加问题
- 🎛️ **标志支持** - 支持正则表达式标志（g, i, m, s, u, y）
- 🛡️ **错误处理** - 友好的错误提示和状态显示
- 🚀 **性能优化** - 300ms防抖技术，流畅的用户体验
- 🌙 **主题适配** - 深色主题设计，完美融入VSCode环境
- 📱 **高DPI支持** - 支持Retina显示器，锐利渲染

## 📦 安装指南

可直接在VSCode插件市场中搜索

### 方法一：安装 VSIX 文件（推荐）

1. **下载 VSIX 文件**
   - 获取 `regex-test-preview-0.0.1.vsix` 文件

2. **在 VSCode 中安装**
   - 打开 VSCode
   - 按 `Ctrl+Shift+P` 打开命令面板
   - 输入 "Extensions: Install from VSIX"
   - 选择下载的 VSIX 文件

3. **重新加载 VSCode**
   - 安装完成后，按 `Ctrl+Shift+P`
   - 输入 "Developer: Reload Window"
   - 选择重新加载窗口

### 方法二：开发模式安装

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd RegexTestPreview
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **编译代码**
   ```bash
   npm run compile
   ```

4. **在 VSCode 中调试**
   - 打开项目文件夹
   - 按 `F5` 启动调试会话
   - 在新窗口中测试插件

### 验证安装

1. **检查插件列表**
   - 按 `Ctrl+Shift+X` 打开扩展面板
   - 搜索 "Regex Test Preview"
   - 确认插件已安装

2. **测试功能**
   - 按 `Ctrl+Shift+P`
   - 输入 "Regex Test Preview"
   - 选择 "Open Regex Test Preview"
   - 测试正则表达式功能

## 🚀 使用方法

### 启动插件

1. 安装插件后，按 `Ctrl+Shift+P`
2. 输入 "Regex Test Preview" 或 "Open Regex Test Preview"
3. 选择命令打开测试面板

### 界面说明

在打开的面板中：

- **正则表达式输入框**：输入正则表达式模式
- **标志输入框**：输入正则标志（默认为 g）
- **测试文本区域**：可直接编辑的文本区域，背景显示高亮匹配结果
- **状态栏**：显示匹配数量和错误信息

### 操作步骤

1. 在第一个输入框中输入正则表达式
2. 在标志框中输入正则标志（可选）
3. 在文本区域中输入或编辑测试文本
4. 查看自动高亮的匹配结果

### 快捷键

- `Ctrl+Shift+P` → "Regex Test Preview" - 打开正则测试面板
- `Escape` - 快速切换到高亮查看模式

## 📚 示例演示

### 1. 数字匹配
```
正则表达式: \d+
标志: g
测试文本: Hello 123 World 456 Test 789
预期结果: 数字 123、456、789 会被高亮显示
```

### 2. 邮箱验证
```
正则表达式: [a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}
标志: g
测试文本:
支持以下邮箱:
- user@example.com
- test.email+alex@company.org
- user_name@sub.domain.co.uk
- invalid.email@ (这个不会被匹配)
```

### 3. 手机号提取
```
正则表达式: 1[3-9]\d{9}
标志: g
测试文本:
联系方式:
张三: 13812345678
李四: 15987654321
王五: 12345678901 (格式不正确)
```

### 4. URL匹配
```
正则表达式: https?://[^\s]+
标志: g
测试文本:
有用的网站:
- https://www.google.com
- http://github.com
- https://regex101.com
```

### 5. 提取HTML标签
```
正则表达式: <[^>]+>
标志: g
测试文本: <div class="container"><p>Hello <strong>World</strong></p></div>
```

### 6. 日期格式匹配
```
正则表达式: \d{4}[-/]\d{1,2}[-/]\d{1,2}
标志: g
测试文本:
重要日期:
2024-01-01
2024/12/25
2024-2-14
```

### 7. 匹配单词（忽略大小写）
```
正则表达式: \btest\w*
标志: gi
测试文本: This is a Test of testing functionality
```

### 标志说明

- `g` - 全局匹配（查找所有匹配项）
- `i` - 忽略大小写
- `m` - 多行模式
- `s` - 点号匹配换行符
- `u` - Unicode模式
- `y` - 粘性匹配

## 🏗️ 技术架构与演进

### 当前技术方案（contenteditable + HTML高亮）

**核心原理：**
- **contenteditable div** 用于文本输入和高亮显示
- **innerHTML** 动态更新实现实时高亮效果
- **光标位置管理** 精确保存和恢复光标位置
- **文本复制技术** 通过重建HTML实现高亮覆盖

**技术特点：**
1. **实时高亮渲染** - 通过innerHTML动态更新实现即时高亮效果
2. **光标位置管理** - 实现完整的光标位置保存和恢复机制
3. **文本复制技术** - 重建HTML内容实现精确的高亮覆盖
4. **DOM节点遍历** - 使用TreeWalker API高效遍历文本节点
5. **Selection/Range API** - 精确控制光标位置和选择状态

### 技术演进历程

#### 版本1.0：初始实现
- 使用隐藏的textarea + 显示的div
- 需要点击切换编辑模式
- 高亮显示有延迟

#### 版本2.0：Overlay实时高亮
- 使用透明的overlay覆盖在textarea上方
- 实现了真正的实时高亮
- 但出现了文字叠加和对齐问题

#### 版本3.0：Canvas背景高亮
- 使用Canvas绘制高亮背景
- 彻底解决文字叠加问题
- 支持精确对齐和高DPI显示

#### 版本4.0：contenteditable实时高亮（当前）
- 使用contenteditable div统一编辑和显示
- 实现文本复制高亮技术
- 修复光标位置错乱问题
- 极简界面设计，无需按钮操作

### 核心技术

- **TypeScript**: 主要开发语言
- **VSCode Extension API**: 插件框架
- **Webview**: UI界面实现
- **contenteditable**: 可编辑文本区域
- **Selection/Range API**: 光标位置控制
- **TreeWalker API**: DOM节点遍历
- **HTML/CSS/JavaScript**: 前端技术
- **正则表达式**: 核心功能

## 🔧 故障排除与已知问题修复

### 已修复的主要问题

#### 1. 页面初始化问题
**问题**：插件界面出现JavaScript错误，缺少初始文本内容
**解决**：
- 恢复初始文本内容
- 增强错误处理机制
- 改进初始化逻辑

#### 2. 文字叠加问题
**问题**：textarea和overlay的文字没有完全对齐，高亮背景遮盖文字
**解决**：
- 放弃overlay方案
- 使用Canvas + textarea组合方案
- 彻底解决文字叠加问题

#### 3. 高亮对齐问题
**问题**：高亮和实际匹配文本出现对齐偏差
**解决**：
- 使用精确文本测量而非估算
- 支持高DPI渲染
- 改进定位算法

### 常见问题解答

### Q: 插件无法启动？
A: 确保 VSCode 版本 >= 1.74.0，并重新加载窗口。

### Q: 正则匹配不工作？
A: 检查正则表达式语法是否正确，确保标志使用正确。

### Q: 高亮不显示？
A: 确保输入了有效的正则表达式和测试文本。

### Q: 高亮位置不准确？
A: 插件使用精确文本测量，如有偏差请检查字体设置是否为等宽字体。

### Q: 如何编辑文本？
A: 文本区域始终可编辑，直接点击即可编辑。

### Q: 如何卸载插件？
A: 在扩展面板中找到 Regex Test Preview，点击卸载按钮。

### Q: 支持哪些正则标志？
A: 支持 g, i, m, s, u, y 等常用标志。

### Q: 插件是否会保存我的正则表达式？
A: 当前版本不会保存，建议您复制常用的正则表达式到其他地方。

## 🛠️ 开发指南

### 构建要求

- Node.js 16+
- VSCode 1.74+
- TypeScript 4.9+

### 项目结构

```
RegexTestPreview/
├── src/
│   └── extension.ts          # 主要扩展逻辑
├── out/                      # 编译输出目录
├── resources/
│   └── icons/
│       └── regex-icon.svg    # 插件图标
├── .vscode/
│   ├── launch.json           # 调试配置
│   └── tasks.json            # 任务配置
├── package.json              # 项目配置
├── tsconfig.json             # TypeScript配置
├── .eslintrc.json           # ESLint配置
├── .vscodeignore            # VSCode忽略文件
├── .gitignore               # Git忽略文件
├── README.md                # 项目说明
└── LICENSE                  # 许可证文件
```

### 开发命令

```bash
npm install          # 安装依赖
npm run compile      # 编译代码
npm run watch        # 监听模式编译
npm run lint         # 代码检查
npm run package      # 打包插件
npm run publish      # 发布插件
```

### 调试方法

1. 按 `F5` 启动调试会话
2. 在新的VSCode窗口中测试插件

## 📊 发布指南

### 发布前的准备工作

1. **配置package.json**
   ```json
   {
     "publisher": "YOUR_PUBLISHER_NAME",
     "repository": {
       "type": "git",
       "url": "https://github.com/YOUR_USERNAME/regex-test-preview.git"
     },
     "license": "MIT"
   }
   ```

2. **获取Publisher Name**
   - 访问 [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/)
   - 登录并创建Publisher名称

3. **发布插件**
   ```bash
   npm install -g @vscode/vsce
   vsce login YOUR_PUBLISHER_NAME
   npm run publish
   ```

### 发布检查清单

- [ ] 代码编译无错误：`npm run compile`
- [ ] 代码规范检查：`npm run lint`
- [ ] 插件能正常启动：按 `F5` 测试
- [ ] 所有功能正常工作
- [ ] README.md 内容完整
- [ ] package.json 字段正确
- [ ] 版本号合适

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

### 提交Issue

1. 描述问题的详细信息
2. 提供复现步骤
3. 包含相关的错误信息
4. 说明您的VSCode版本和插件版本

### 提交Pull Request

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request

### 未来改进方向

1. **保存历史记录**: 记住常用的正则表达式
2. **导入/导出**: 支持正则表达式的导入导出
3. **语法提示**: 正则表达式语法高亮和自动补全
4. **更多标志**: 支持更多正则引擎的标志
5. **性能统计**: 显示匹配性能数据
6. **测试用例**: 内置常用的正则表达式示例
7. **主题自定义**: 支持自定义高亮颜色

## 📝 更新日志

### v0.0.1 (最新)
- ✅ **自动实时匹配** - 无需按钮，输入即匹配
- ✅ **Canvas背景高亮** - 彻底解决文字叠加问题
- ✅ **精确对齐** - 使用真实文本测量，完美对齐
- ✅ **高DPI支持** - 支持Retina显示器
- ✅ **性能优化** - 300ms防抖技术
- ✅ **界面优化** - 自适应宽度和一致样式
- ✅ **错误处理** - 友好的错误提示
- ✅ **完整文档** - 详细的使用指南和示例

### 技术演进
- **v0.0.1-alpha**: 初始实现，基本功能
- **v0.0.1-beta**: 添加实时高亮，overlay方案
- **v0.0.1-rc**: 修复文字叠加问题，Canvas方案
- **v0.0.1**: 优化对齐，高DPI支持，正式发布

## 📚 技术文档

### Bug修复报告详情

#### 光标位置Bug修复 (v1.0.1)

##### 问题描述
在使用contenteditable div实现实时高亮功能时，出现字符倒序显示问题：
- 用户逐字输入文本时，字符会出现倒序显示
- 例如：输入"14"会显示为"41"

##### 根本原因分析
1. **DOM重建导致光标丢失** - 调用`innerHTML`重新设置内容时，原有DOM节点被销毁，光标引用失效
2. **浏览器光标行为** - contenteditable的光标基于DOM节点位置，DOM重建后光标重置到开头
3. **高亮更新与用户输入冲突** - 实时高亮更新频率高，没有正确的同步机制

##### 修复方案
实现了完整的光标位置管理机制：

```javascript
// 保存光标位置函数
function getCursorOffset(element) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return 0;

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);

    // 计算光标在纯文本中的偏移量
    const plainText = preCaretRange.toString();
    return plainText.length;
}

// 恢复光标位置函数
function setCursorPosition(element, offset) {
    const textContent = element.innerText || element.textContent || '';
    const maxOffset = Math.min(offset, textContent.length);

    // 使用TreeWalker遍历所有文本节点
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    let currentOffset = 0;
    let targetNode = null;
    let targetOffset = 0;

    while (walker.nextNode()) {
        const node = walker.currentNode;
        const nodeLength = node.textContent.length;

        if (currentOffset + nodeLength >= maxOffset) {
            targetNode = node;
            targetOffset = maxOffset - currentOffset;
            break;
        }

        currentOffset += nodeLength;
    }

    // 设置光标到目标位置
    if (targetNode) {
        const range = document.createRange();
        const selection = window.getSelection();
        range.setStart(targetNode, targetOffset);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}
```

#### 长文本高亮定位Bug修复

##### 问题背景
长文本的高亮定位不准确，匹配文本的高亮位置与原文本不对应，多行文本中出现错位现象。

##### 根本原因分析
1. **Canvas方案问题** - 使用固定字符宽度（8px）不准确，中文字符宽度与英文字符不同
2. **DOM测量方案问题** - 频繁创建/销毁DOM元素影响性能，测量结果不一致

##### 最终解决方案：文本复制高亮技术
放弃复杂的坐标计算，采用更直接的文本复制方法：

```javascript
function applyHighlights(matches) {
    if (!matches || matches.length === 0) {
        textEditor.innerHTML = escapeHtml(currentText);
        return;
    }

    // 保存光标位置
    const cursorOffset = getCursorOffset(textEditor);

    // 构建高亮HTML
    let highlightedHTML = '';
    let lastEnd = 0;

    matches.forEach((match, index) => {
        // 添加匹配前的普通文本
        highlightedHTML += escapeHtml(currentText.substring(lastEnd, match.start));
        // 添加高亮的匹配文本
        highlightedHTML += '<span class="highlight">' + escapeHtml(match.text) + '</span>';
        lastEnd = match.end;
    });

    // 添加剩余的文本
    highlightedHTML += escapeHtml(currentText.substring(lastEnd));

    // 应用高亮
    textEditor.innerHTML = highlightedHTML;

    // 恢复光标位置
    setTimeout(() => {
        setCursorPosition(textEditor, cursorOffset);
    }, 0);
}
```

**方案优势：**
- **精确性** - 直接基于文本位置构建HTML，避免坐标计算误差
- **简洁性** - 代码简单易懂，维护成本低
- **可靠性** - 不依赖复杂的DOM测量或Canvas计算
- **性能好** - 避免频繁的DOM操作和测量

#### 焦点管理Bug修复 (v1.0.2)

##### 问题描述
在Regular Expression输入框中输入时，焦点会意外转移到Test Text编辑器，导致用户输入的字符出现在错误位置。

##### 根本原因分析
`selection.addRange()` 不仅设置光标位置，还会将焦点转移到目标元素，即使用户正在输入框中编辑，也会强制焦点转移到contenteditable div。

##### 修复方案：焦点感知的高亮更新
修改高亮应用逻辑，只在必要时恢复光标位置：

```javascript
function applyHighlights(matches) {
    if (!matches || matches.length === 0) {
        textEditor.innerHTML = escapeHtml(currentText);
        return;
    }

    // 检查当前焦点是否在文本编辑器中
    const activeElement = document.activeElement;
    const isTextEditorFocused = activeElement === textEditor;

    // 保存当前光标位置（仅当焦点在文本编辑器中时）
    let cursorOffset = 0;
    if (isTextEditorFocused) {
        cursorOffset = getCursorOffset(textEditor);
    }

    // ... 构建高亮HTML的代码 ...

    // 应用高亮
    textEditor.innerHTML = highlightedHTML;

    // 恢复光标位置（仅当焦点在文本编辑器中时）
    if (isTextEditorFocused) {
        setTimeout(() => {
            setCursorPosition(textEditor, cursorOffset);
        }, 0);
    }
}
```

**关键改进：**
- **焦点感知** - 检测当前焦点所在的控件
- **条件性操作** - 只在必要时恢复光标位置
- **用户体验** - 不会中断用户的输入操作
- **智能判断** - 避免不必要的DOM操作

### 核心技术要点总结

#### 1. Selection和Range API
- `window.getSelection()` - 获取当前选择对象
- `selection.getRangeAt(0)` - 获取当前Range
- `range.cloneRange()` - 克隆Range进行计算
- `range.setStart/setEnd` - 设置Range边界

#### 2. TreeWalker API
- `document.createTreeWalker()` - 创建DOM遍历器
- `NodeFilter.SHOW_TEXT` - 只遍历文本节点
- `walker.nextNode()` - 遍历到下一个节点

#### 3. 焦点管理原则
- **最小干扰** - 尽量不改变用户的焦点状态
- **智能判断** - 根据上下文决定是否需要操作焦点
- **用户优先** - 用户的操作意图应该被尊重

#### 4. 性能优化经验
- **避免复杂的坐标计算** - 在Web环境中，文本位置的计算很难做到完全精确
- **优先使用文本操作** - 直接基于字符串操作比DOM测量更可靠
- **简单方案往往是最好的** - 复杂的解决方案通常意味着更多的潜在bug和更高的维护成本

### 版本更新日志
#### v1.0.2 (2024-11-14)
- 🐛 **修复**: 输入框焦点丢失问题，防止输入内容出现在错误位置
- 🔧 **改进**: 实现焦点感知的高亮更新机制
- 📚 **新增**: 添加焦点管理Bug修复技术文档

#### v1.0.1 (2024-10-28)
- 🐛 **修复**: contenteditable中逐字输入字符倒序显示的问题
- 🔧 **改进**: 实现了精确的光标位置保存和恢复机制
- 📚 **新增**: 添加了详细的技术文档和Bug修复报告

#### v1.0.0 (2024-10-27)
- 🎉 **发布**: 正式版本发布
- ✨ **特性**: 实时高亮、多行支持、极简界面
- 🚀 **性能**: 优化渲染性能和用户体验

## 📄 许可证

MIT License

---

**享受自动实时高亮的正则表达式测试体验！** ⚡

如果这个插件对您有帮助，请给个⭐️鼓励一下！
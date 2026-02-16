// ==UserScript==
// @name         GGn Quick Copy BBCode (Clean Title)
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  一键复制净化后的 [url]标题[/url] 及指定后缀
// @author       YourName
// @match        https://gazellegames.net/torrents.php?id=*
// @grant        GM_setClipboard
// ==/UserScript==

(function() {
    'use strict';

    const titleNode = document.querySelector('.header > h2') || document.querySelector('h2');

    if (!titleNode) {
        console.error('未找到标题元素');
        return;
    }

    const btn = document.createElement('button');
    btn.innerText = '复制BBCode';
    btn.style.marginLeft = '12px';
    btn.style.fontSize = '12px';
    btn.style.padding = '3px 8px';
    btn.style.cursor = 'pointer';
    btn.style.border = '1px solid #555';
    btn.style.borderRadius = '3px';
    // 修改：背景改为深色，文字改为白色
    btn.style.backgroundColor = '#444';
    btn.style.color = '#ffffff';
    btn.style.verticalAlign = 'middle';

    btn.addEventListener('click', function(e) {
        e.preventDefault();

        const currentUrl = window.location.href.split('#')[0];

        // 克隆节点提取文本
        const clone = titleNode.cloneNode(true);
        const buttons = clone.getElementsByTagName('button');
        while (buttons.length > 0) {
            buttons[0].parentNode.removeChild(buttons[0]);
        }
        let titleText = clone.textContent.trim();

        // --- 核心修改区域：标题清洗逻辑 ---

        // 1. 去除平台信息：匹配开头直到 " – " (注意这是长横线) 的所有内容并删除
        // 逻辑：^.*? 懒惰匹配开头，直到遇到 " – "
        titleText = titleText.replace(/^.*? – /, '');

        // 2. 去除分级信息：匹配结尾的 [...] 并删除
        // 逻辑：\[ 匹配左括号, [^\]]+ 匹配非右括号内容, \] 匹配右括号, $ 匹配结尾
        titleText = titleText.replace(/\[[^\]]+\]$/, '');

        // 再次去除首尾可能残留的空格
        titleText = titleText.trim();

        // --- 构造输出内容 ---
        // 第一行：URL格式
        // 第二行：指定的固定文本
        const fixedSuffix = "sport，Adventure，RPG 2013-2023";
        const bbcode = `[url=${currentUrl}]${titleText}[/url]\n${fixedSuffix}`;

        GM_setClipboard(bbcode);

        // 反馈动画
        const originalText = btn.innerText;
        const originalBg = btn.style.backgroundColor;
        btn.innerText = '已复制!';
        btn.style.backgroundColor = '#28a745'; // 绿色反馈

        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.backgroundColor = originalBg;
        }, 1500);
    });

    titleNode.appendChild(btn);
})();

// ==UserScript==
// @name         GGn Add to Collections)
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Adds buttons to the Tags box to quickly add the torrent to collection 7870 or a custom collection.
// @author       YourName
// @match        https://gazellegames.net/torrents.php?id=*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // === 配置常量 ===
    const HANIZATION_COLLAGE_ID = '7870'; // 汉化合集ID
    const HANIZATION_LABEL = '添加到汉化合集'; // 按钮显示的文字

    // === 核心逻辑 ===

    // 1. 获取 Auth Key
    function getAuthKey() {
        const scripts = document.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
            const match = scripts[i].innerHTML.match(/authkey\s*=\s*"([a-f0-9]+)"/);
            if (match) return match[1];
        }
        // 备用方案：尝试从 logout 链接获取
        const logoutLink = document.querySelector('a[href*="logout.php"]');
        if (logoutLink) {
            const match = logoutLink.href.match(/auth=([a-f0-9]+)/);
            if (match) return match[1];
        }
        return null;
    }

    // 2. 通用添加函数
    function addToCollage(collageId, btnElement) {
        if (!collageId) {
            alert('请输入有效的合集 ID');
            return;
        }

        const authKey = getAuthKey();
        if (!authKey) {
            alert('无法获取 Auth Key，请刷新页面重试');
            return;
        }

        // UI 反馈：保存原文本并显示加载中
        const isInputBtn = (btnElement.tagName === 'INPUT'); // 判断是按钮还是提交键
        const originalText = isInputBtn ? btnElement.value : btnElement.innerText;

        if (isInputBtn) btnElement.value = '...';
        else btnElement.innerText = '添加中...';

        btnElement.disabled = true;
        btnElement.style.cursor = 'wait';

        // 构建请求
        const formData = new FormData();
        formData.append('action', 'add_torrent');
        formData.append('auth', authKey);
        formData.append('collageid', collageId);
        formData.append('url', window.location.href);

        fetch('collections.php', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok) {
                // 成功反馈
                if (isInputBtn) btnElement.value = '√';
                else btnElement.innerText = '已添加！';

                btnElement.style.color = '#4CAF50'; // 绿色

                // 2秒后恢复状态
                setTimeout(() => {
                    if (isInputBtn) btnElement.value = originalText;
                    else btnElement.innerText = originalText;
                    btnElement.disabled = false;
                    btnElement.style.color = '';
                    btnElement.style.cursor = 'pointer';
                    // 如果是输入框按钮，顺便清空输入框？不，保留方便重复确认
                }, 2000);
            } else {
                throw new Error('Network response error');
            }
        })
        .catch(err => {
            console.error(err);
            if (isInputBtn) btnElement.value = 'X';
            else btnElement.innerText = '失败';
            btnElement.style.color = 'red';
            alert('添加失败，请检查网络或确认该种子是否已在合集中。');

            setTimeout(() => {
                 if (isInputBtn) btnElement.value = originalText;
                 else btnElement.innerText = originalText;
                 btnElement.disabled = false;
                 btnElement.style.color = '';
                 btnElement.style.cursor = 'pointer';
            }, 2000);
        });
    }

    // 3. 构建 UI 界面
    function initUI() {
        // 修改选择器：定位到 Tags 盒子
        const tagsBox = document.querySelector('.box_tags');
        if (!tagsBox) return;

        // 创建主容器
        const container = document.createElement('div');
        container.style.borderTop = '1px solid #333'; // 顶部分割线
        container.style.marginTop = '10px';
        container.style.padding = '10px 5px';
        container.style.textAlign = 'center';

        // --- A. 汉化合集快速按钮 ---
        const btnHanization = document.createElement('a');
        btnHanization.href = '#';
        btnHanization.innerText = `[ ${HANIZATION_LABEL} ]`;
        btnHanization.style.fontWeight = 'bold';
        btnHanization.style.color = '#4CAF50'; // 醒目的绿色
        btnHanization.style.display = 'block';
        btnHanization.style.marginBottom = '8px';
        btnHanization.style.textDecoration = 'none';

        btnHanization.onclick = (e) => {
            e.preventDefault();
            addToCollage(HANIZATION_COLLAGE_ID, btnHanization);
        };

        // --- B. 自定义 ID 输入区域 ---
        const customDiv = document.createElement('div');
        customDiv.style.display = 'flex';
        customDiv.style.justifyContent = 'center';
        customDiv.style.alignItems = 'center';
        customDiv.style.gap = '5px';

        // 输入框
        const inputId = document.createElement('input');
        inputId.type = 'text';
        inputId.placeholder = 'Collage ID';
        inputId.style.width = '80px';
        inputId.style.padding = '3px';
        inputId.style.textAlign = 'center';
        inputId.style.fontSize = '11px';
        inputId.style.border = '1px solid #666';
        inputId.style.borderRadius = '3px';
        inputId.style.backgroundColor = '#222';
        inputId.style.color = '#fff';

        // 确认按钮
        const btnCustom = document.createElement('input');
        btnCustom.type = 'button';
        btnCustom.value = 'Add';
        btnCustom.style.padding = '3px 8px';
        btnCustom.style.cursor = 'pointer';
        btnCustom.style.border = '1px solid #666';
        btnCustom.style.borderRadius = '3px';
        btnCustom.style.backgroundColor = '#444';
        btnCustom.style.color = '#fff';

        btnCustom.onclick = () => {
            const cid = inputId.value.trim();
            if(!cid || isNaN(cid)) {
                alert("请输入纯数字 ID");
                return;
            }
            addToCollage(cid, btnCustom);
        };

        // 组装
        customDiv.appendChild(inputId);
        customDiv.appendChild(btnCustom);

        container.appendChild(btnHanization);
        container.appendChild(customDiv);

        // 插入到 Tags 盒子底部
        tagsBox.appendChild(container);
    }

    // 启动
    initUI();

})();

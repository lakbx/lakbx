// ==UserScript==
// @name        GGn VNDB uploady new (Windows Only + Auto Config + Year Sync)
// @namespace   none
// @version     9.4-WinAuto-YearSync
// @description Enhanced version for Windows Only with Auto Platform, Dynamic Requirements & Year Sync
// @author      ingts (modified for Windows)
// @match       https://gazellegames.net/upload.php*
// @match       https://gazellegames.net/torrents.php?action=editgroup*
// @connect     api.vndb.org
// @grant       GM.xmlHttpRequest
// @grant       GM_getValue
// @grant       GM_setValue
// @require     https://update.greasyfork.org/scripts/548332/1727369/GGn%20Uploady.js
// ==/UserScript==

// ========== CONFIGURATION ==========
// 可配置选项
if (typeof GM_getValue('auto_search_trailer') === 'undefined')
    GM_setValue('auto_search_trailer', false)

if (typeof GM_getValue('auto_ptpimg') === 'undefined')
    GM_setValue('auto_ptpimg', true)

if (typeof GM_getValue('force_rating_18') === 'undefined')
    GM_setValue('force_rating_18', true)

// 默认标签配置
const DEFAULT_TAGS = ["adult","anime", "visual.novel", "2d","slice.of.life","first.person","fixed.view"];

// --- 系统配置模板 ---

// 1. 现代配置 (> 2015)
const REQ_MODERN = `[b]Minimum[/b]
[*][b]OS[/b]: Windows 8/10/11
[*][b]Processor[/b]: Intel Core i3 1 GHz
[*][b]Memory[/b]: 2 GB RAM
[*][b]Graphics[/b]: Integrated graphics
[*][b]DirectX[/b]: 9.0c
[*][b]Storage[/b]: 8 GB
[b]Recommended[/b]
[*][b]OS[/b]: Windows 8/10/11
[*][b]Memory[/b]: 4 GB RAM
[*][b]Storage[/b]: 16 GB`;

// 2. Windows 7 时代配置 (2010 - 2015)
const REQ_WIN7 = `[*][b]OS[/b]: Windows 7
[*][b]Processor[/b]: Intel Core i3 1 GHz
[*][b]Memory[/b]: 1 GB RAM
[*][b]DirectX[/b]: 7.0c
[*][b]Storage[/b]: 4 GB`;

// 3. 复古配置 (<= 2009)
const REQ_RETRO = `[*][b]OS[/b]: Windows 98/ME/2000/XP
[*][b]CPU[/b]: 500 MHz
[*][b]HDD[/b]: 1.8 GB
[*][b]RAM[/b]: 256 MB
[*][b]DirectX[/b]: 9.0`;

// ========== END CONFIGURATION ==========

const tagsDictionary = {
    'romance': ["Love", "Polyamory", "Polygamy", "Swinging", "Romance"],
    'horror': ["Horror", "Graphic Violence"],
    'science.fiction': ["Science Fiction", "AI"],
    'drama': ["Drama", "Suicide", "Suicidal", "Desperation"],
    'crime': ["Crime", "Slave"],
    'mystery': ["Mystery", "Amnesia", "Disappearance", "Secret Identity"],
    'comedy': ["Comedy", "Slapstick", "Comedic"],
    'fantasy': ["Fantasy", "Magic", "Mahou", "Superpowers"]
}

function removeLastBracket(str) {
    if (!str) return ''
    if (!str.endsWith(']')) return str
    let i = str.length - 1
    let bracketCounter = 0
    for (; i >= 0; i--) {
        if (str[i] === ']') {
            bracketCounter++
        } else if (str[i] === '[') {
            bracketCounter--
            if (bracketCounter === 0) break
        }
    }
    return str.substring(0, i).trim()
}

/** @type {HTMLInputElement} */
const gameTitleInput = document.getElementById('title')

/**
 * @typedef Result
 * @property {VisualNovel} vn
 * @property {Release[]} releases
 */

/**
 * @param {Result} result
 */
function fillUpload(result) {
    const vn = result.vn

    // 自动选择 Platform 为 Windows
    const platformSelect = document.getElementById('platform');
    if (platformSelect) {
        platformSelect.value = 'Windows';
    }

    const englishTitle = vn.titles.find(a => a.lang === 'en')
    gameTitleInput.value = getTitle(result, englishTitle)

    if (GM_getValue('auto_search_trailer'))
        window.open(`https://www.youtube.com/results?search_query=${gameTitleInput.value} trailer`, '_blank').focus()

    const aliasInput = document.getElementById('aliases')
    aliasInput.value = getAliases(result, englishTitle)

    const foundTags = new Set()
    const noRomance = vn.tags.some(tag => tag.name === "No Romance Plot")
    for (const [ggnTag, vndbTagsArr] of Object.entries(tagsDictionary)) {
        if (ggnTag === 'romance' && noRomance) continue
        for (const resultTag of vn.tags) {
            if (vndbTagsArr.some(word => resultTag.name.includes(word)))
                foundTags.add(ggnTag)
        }
    }

    DEFAULT_TAGS.forEach(tag => foundTags.add(tag));
    const tagString = Array.from(foundTags).join(', ');
    document.querySelector('input[name="tags"]').value = tagString;

    document.getElementById('year').value = getYear(result)

    const coverUrl = vn.image.url;
    document.getElementById('image').value = coverUrl;

    if (GM_getValue('auto_ptpimg') && coverUrl) {
        setTimeout(() => {
            const imageInput = document.getElementById('image');
            if (imageInput && imageInput.nextElementSibling) {
                imageInput.nextElementSibling.click();
            }
        }, 100);
    }

    document.getElementById('album_desc').value = getDescription(result)

    if (GM_getValue('force_rating_18')) {
        document.getElementById('Rating').value = 9;
    } else {
        document.getElementById('Rating').value = getAgeRating(result);
    }

    const screenshots = vn.screenshots.map(s => s.url);
    insertScreenshots(screenshots, true);

    if (GM_getValue('auto_ptpimg') && screenshots.length > 0) {
        setTimeout(() => {
            const screenBoxes = document.querySelectorAll('input[name="screens[]"]');
            screenBoxes.forEach((box, index) => {
                if (screenshots[index] && box.nextElementSibling) {
                    box.value = screenshots[index];
                    setTimeout(() => {
                        box.nextElementSibling.click();
                    }, 200 * (index + 1));
                }
            });
        }, 500);
    }
}

function autoClickPTPImg() {
    if (!GM_getValue('auto_ptpimg')) return;
    const coverInput = document.getElementById('image');
    if (coverInput && coverInput.value && coverInput.nextElementSibling) {
        coverInput.nextElementSibling.click();
    }
    setTimeout(() => {
        const screenBoxes = document.querySelectorAll('input[name="screens[]"]');
        screenBoxes.forEach((box, index) => {
            if (box.value && box.nextElementSibling) {
                setTimeout(() => {
                    box.nextElementSibling.click();
                }, 200 * (index + 1));
            }
        });
    }, 300);
}

const idRegExp = /v(\d+)/

if (location.href.includes('upload.php')) {
    gameTitleInput.insertAdjacentHTML("afterend",
    `<div style="margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 5px; color: #333;">
        <strong style="color: #333;">VNDB Uploady (Windows Only):</strong><br>
        <label style="display: block; margin: 5px 0; color: #333;">
            <input type="checkbox" id="auto_ptpimg_checkbox" ${GM_getValue('auto_ptpimg') ? 'checked' : ''}> 自动PTPImg上传
        </label>
        <label style="display: block; margin: 5px 0; color: #333;">
            <input type="checkbox" id="force_rating_checkbox" ${GM_getValue('force_rating_18') ? 'checked' : ''}> 强制18+分级
        </label>
        <label style="display: block; margin: 5px 0; color: #333;">
            <input type="checkbox" id="auto_trailer_checkbox" ${GM_getValue('auto_search_trailer') ? 'checked' : ''}> 自动搜索预告片
        </label>
        <div style="margin-top: 10px;">
            <a href="javascript:" id="fill_vndb" style="display: inline-block; margin-right: 10px; padding: 5px 15px; background: #4CAF50; color: white; border-radius: 3px; text-decoration: none;">从VNDB填充</a>
            <a href="javascript:" id="fill_hanization" style="display: inline-block; padding: 5px 15px; background: #2196F3; color: white; border-radius: 3px; text-decoration: none;">汉化发布模版</a>
        </div>
    </div>`
    );

    const fill_vndb = document.getElementById('fill_vndb');
    fill_vndb.onclick = () => {
        if (!gameTitleInput.value) return;
        const idMatch = idRegExp.exec(gameTitleInput.value)?.[0];
        if (!idMatch) return;
        document.getElementById('vndburi').value = `https://vndb.org/${idMatch}`;
        req(idMatch).then(fillUpload);
    };

    const fill_hanization = document.getElementById('fill_hanization');
    fill_hanization.onclick = () => {
        // 【新增逻辑】获取 Group Information 中的年份
        const groupYearInput = document.getElementById('year');
        const groupYearValue = groupYearInput ? groupYearInput.value : "";

        const remasterCheckbox = document.getElementById('remaster');
        if (remasterCheckbox && !remasterCheckbox.checked) {
            remasterCheckbox.click();
        }
        setTimeout(() => {
            const remasterTitle = document.getElementById('remaster_title');
            if (remasterTitle) {
                remasterTitle.value = "Unofficial Translation";
                remasterTitle.disabled = false;
            }
            const remasterYear = document.getElementById('remaster_year');
            if (remasterYear) {
                // 【新增逻辑】将 Group Year 填入 Remaster Year
                remasterYear.value = groupYearValue;
                remasterYear.disabled = false;
            }
        }, 50);

        const ripsrcHome = document.getElementById('ripsrc_home');
        if (ripsrcHome) {
            ripsrcHome.click();
            ripsrcHome.checked = true;
        }

        setTimeout(() => {
            const releaseTitle = document.getElementById('release_title');
            if (releaseTitle) releaseTitle.value = "";
        }, 100);

        const miscSelect = document.getElementById('miscellaneous');
        if (miscSelect) {
            miscSelect.value = 'Home Rip';
            miscSelect.dispatchEvent(new Event('change'));
        }

        const gameVer = document.getElementById('gamedoxvers');
        if (gameVer) gameVer.value = "";

        const langSelect = document.getElementById('language');
        if (langSelect) langSelect.value = 'Chinese';

        const descArea = document.getElementById('release_desc');
        if (descArea) {
            descArea.value = `Text language: Chinese\nVoice language: Japanese\nTranslation release date: \nTranslator: \nThis upload contains mosaic censorship.\n\nExtract and run cmvs32_cn.exe for Chinese`;
        }
    };

    document.getElementById('auto_ptpimg_checkbox').onchange = function() {
        GM_setValue('auto_ptpimg', this.checked);
    };
    document.getElementById('force_rating_checkbox').onchange = function() {
        GM_setValue('force_rating_18', this.checked);
    };
    document.getElementById('auto_trailer_checkbox').onchange = function() {
        GM_setValue('auto_search_trailer', this.checked);
    };

    const imageInput = document.getElementById('image');
    if (imageInput) {
        imageInput.insertAdjacentHTML('afterend',
            ' <a href="javascript:" id="manual_ptpimg" title="手动触发PTPImg上传">📤</a>'
        );
        document.getElementById('manual_ptpimg').onclick = autoClickPTPImg;
    }
} else {
    createFiller('vndburi', idRegExp, req, {
        getAliases: r => getAliases(r),
        getCover: r => {
            const coverUrl = r.vn.image.url;
            if (GM_getValue('auto_ptpimg') && coverUrl) {
                setTimeout(() => {
                    const imageInput = document.getElementById('image');
                    if (imageInput && imageInput.nextElementSibling) {
                        imageInput.nextElementSibling.click();
                    }
                }, 100);
            }
            return coverUrl;
        },
        getAgeRating: r => GM_getValue('force_rating_18') ? 9 : getAgeRating(r),
        getDescription: getDescription,
        getScreenshots: result => result.vn.screenshots.map(s => s.url),
        getYear: getYear,
        getTitle: getTitle,
        onScreenshotsInserted: (screenshots) => {
            if (GM_getValue('auto_ptpimg') && screenshots.length > 0) {
                setTimeout(() => {
                    const screenBoxes = document.querySelectorAll('input[name="screens[]"]');
                    screenBoxes.forEach((box, index) => {
                        if (screenshots[index] && box.nextElementSibling) {
                            setTimeout(() => {
                                box.nextElementSibling.click();
                            }, 200 * (index + 1));
                        }
                    });
                }, 500);
            }
        }
    });
}

/** @returns {Promise<Result>} */
async function req(id) {
    /** @type {Result} */
    const result = {}
    await GM.xmlHttpRequest({
        url: 'https://api.vndb.org/kana/vn',
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        data: JSON.stringify({
            "filters": id ? ["id", "=", id] : ["search", "=", `${gameTitleInput.value}`],
            "fields": "alttitle, titles.title, title, aliases, description, image.url, screenshots.url, released, titles.lang, tags.name, platforms",
            "results": 1
        }),
        responseType: "json",
        onload: response => result.vn = response.response.results[0]
    })

    await GM.xmlHttpRequest({
        url: 'https://api.vndb.org/kana/release',
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        data: JSON.stringify({
            "filters": ["and", ["vn", "=", ["id", "=", result.vn.id]], ["official", "=", 1], ["platform", "=", "win"]],
            "fields": "minage, has_ero, extlinks.id",
            "results": 100
        }),
        responseType: "json",
        onload: response => result.releases = response.response.results
    })

    return result
}

/** @param {Result} result
 * @param {VndbTitle?} englishTitle
 */
function getTitle(result, englishTitle) {
    englishTitle ??= result.vn.titles.find(a => a.lang === 'en')
    return englishTitle ? englishTitle.title : result.vn.title
}

/** @param {Result} result */
function getYear(result) {
    return result.vn.released === 'TBA' ? new Date().getFullYear() + 1 : result.vn.released.split('-')[0]
}

/** @param {Result} result */
function getDescription(result) {
    let year = new Date().getFullYear() + 1;
    if (result.vn.released && result.vn.released !== 'TBA') {
        year = parseInt(result.vn.released.split('-')[0], 10);
    }

    let requirements = REQ_MODERN;

    if (year <= 2009) {
        requirements = REQ_RETRO;
    } else if (year <= 2015) {
        requirements = REQ_WIN7;
    }

    return createDescription(removeLastBracket(result.vn.description), requirements);
}

/** @param {Result} result */
function getAgeRating(result) {
    if (GM_getValue('force_rating_18')) {
        return 9;
    }
    let rating;
    const highestMinAge = Math.max(...result.releases.map(result => result.minage));
    if (highestMinAge === 12 || highestMinAge === 13) rating = 5;
    else if (highestMinAge === 16 || highestMinAge === 17) rating = 7;
    else if (highestMinAge >= 18) rating = 9;
    else rating = 13;
    return rating;
}

/**
 * @param {Result} result
 * @param {VndbTitle?} englishTitle
 * @returns {string}
 */
function getAliases(result, englishTitle) {
    const vn = result.vn
    englishTitle ??= vn.titles.find(a => a.lang === 'en')
    const aliases = [vn.alttitle, vn.aliases.join(", "), englishTitle ? vn.title : null].filter(Boolean)

    for (const externalLink of result.releases.flatMap(release => release.extlinks)) {
        if (/[A-Z]{2}\d{4,}/.test(externalLink.id))
            aliases.push(externalLink.id)
    }

    return joinAliases([...new Set(aliases)])
}

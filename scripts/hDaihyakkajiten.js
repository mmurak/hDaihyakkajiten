class GlobalManager {
	constructor() {
		this.textEntry = document.getElementById("TextEntry");
		this.textEntry.addEventListener("focus", () => {this.textEntry.select();});
		this.indexSearch = document.getElementById("IndexSearch");
		this.indexSearch.addEventListener("click", searchIndex);
		this.eraseEntry = document.getElementById("EraseEntry");
		this.eraseEntry.addEventListener("click", eraseTextEntry);
		this.pageEntry = document.getElementById("PageEntry");
		this.pageEntry.addEventListener("focus", () => {this.pageEntry.select();});
		this.openPage = document.getElementById("OpenPage");
		this.openPage.addEventListener("click", openDirect);
		this.erasePage = document.getElementById("ErasePage");
		this.erasePage.addEventListener("click", erasePageEntry);
		document.addEventListener("keyup", (evt) => {
			if (evt.key == "Enter") {
				if (isElementFocused(this.pageEntry)) {
					openDirect();
					this.pageEntry.focus();
				} else if (evt.shiftKey) {
					searchIndex();
					this.textEntry.focus();
				}
			} else if (evt.key == "Escape") {
				if (isElementFocused(this.pageEntry)) {
					erasePageEntry();
				} else if (isElementFocused(this.textEntry)) {
					eraseTextEntry();
				}
			}
		});
		//
		this.idxURL = "https://dl.ndl.go.jp/pid/12405251/1/";
		this.volInfo = [
			[],
			["https://dl.ndl.go.jp/pid/12405211/1/", 13, 1289],
			["https://dl.ndl.go.jp/pid/12405215/1/", 7, 1454],
			["https://dl.ndl.go.jp/pid/12405219/1/", 7, 1298],
			["https://dl.ndl.go.jp/pid/12405224/1/", 7, 1351],
			["https://dl.ndl.go.jp/pid/12405227/1/", 7, 1275],
			["https://dl.ndl.go.jp/pid/12405230/1/", 6, 1347],
			["https://dl.ndl.go.jp/pid/12405232/1/", 6, 1278],
			["https://dl.ndl.go.jp/pid/12405235/1/", 6, 1274],
			["https://dl.ndl.go.jp/pid/12405237/1/", 6, 1240],
			["https://dl.ndl.go.jp/pid/12405239/1/", 6, 1139],
			["https://dl.ndl.go.jp/pid/12405241/1/", 6, 1322],
			["https://dl.ndl.go.jp/pid/12405244/1/", 6, 1316],
			["https://dl.ndl.go.jp/pid/12405247/1/", 6, 1315],
			["https://dl.ndl.go.jp/pid/12405249/1/", 6, 1339],
			["https://dl.ndl.go.jp/pid/12765756/1/", 6, 1408],
		];
		this.URL = 0;
		this.OFFSET = 1;
		this.ENDPAGE = 2;
	}
}
const G = new GlobalManager();
const R = new Regulator();
G.textEntry.focus();

function searchIndex() {
	let target = G.textEntry.value;
	if (target.match(/^[\s,.　\-a-zA-Z]+$/)) {
		target = target.toLowerCase().replaceAll(/[^a-z]/g, "");
		if (target.length == 0)  rerurn;
		const upperLimit = oubunIndex.length;
		let idx = oubunIndex.length - 1;
		while (oubunIndex[idx] > target) {
			idx--;
		}
		const page = oubunIndex[0] + idx;
		windowOpen(G.idxURL + page, "索引検索結果");
	} else {
		target = target.replace(/[ァ-ン]/g, (s) => {
			return String.fromCharCode(s.charCodeAt(0) - 0x60);
		});
		let rTarget = R.regulate(target);
		if (rTarget.length == 0)  return;
		let idx = wabunIndex.length - 1;
		while (wabunIndex[idx] > rTarget) {
			idx--;
		}
		const page = wabunIndex[0] + idx;
		windowOpen(G.idxURL + page, "索引検索結果");
	}
}

function openDirect() {
	const value = G.pageEntry.value;
	const m = value.match(/(\d\d)(\d+)/);
	if (m == null) {
		alert("閲覧したい巻数を2桁で、続けてページ数を指定してください。");
		return;
	}
	const volNo = Number(m[1]);
	const page = Number(m[2]);
	if (checkInput(volNo, page) == -1)  return;
	const fixedPage = fixMissingPages(volNo, page);
	const frame = Math.trunc(Number(fixedPage) / 2) + G.volInfo[volNo][G.OFFSET];
	windowOpen(G.volInfo[volNo][G.URL] + frame, "検索結果");
}

function fixMissingPages(volNo, page) {
	const missingPages = [
		[11, 465, 468],
	];
	// このロジックは1巻中に欠落ページが散在している場合を想定していない点に注意。
	for (let i = 0; i < missingPages.length; i++) {
		if (volNo == missingPages[i][0]) {
			if ((page >= missingPages[i][1]) && (page <= missingPages[i][2])) {
				alert("このページは欠落しています。");
				return missingPages[i][1];
			}
			if (page > missingPages[i][2]) {
				return page - (missingPages[i][2] - missingPages[i][1] + 1);
			}
		}
	}
	return page;
}

function checkInput(volNo, page) {
	if ((volNo >= G.volInfo.length) || (volNo < 1)) {
		alert("巻数には1〜15を指定してください。");
		return -1;
	}
	if ((G.volInfo[volNo][G.ENDPAGE] < page) || (page < 1)) {
		alert(volNo + "巻で指定可能なページ数は1〜" + G.volInfo[volNo][G.ENDPAGE] + "です。");
		return -1;
	}
	return 0;
}

function eraseTextEntry() {
	G.textEntry.value = "";
	G.textEntry.focus();
}

function erasePageEntry() {
	G.pageEntry.value = "";
	G.pageEntry.focus();
}

function windowOpen(url, title) {
	window.open(url, title);
	G.textEntry.focus();
}

function isElementFocused(elem) {
	return document.activeElement === elem && document.hasFocus();
}

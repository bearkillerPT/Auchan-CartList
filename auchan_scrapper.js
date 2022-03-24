const resList = document.getElementById('resList')
const getListButton = document.getElementById("getList");
const copyListButton = document.getElementById("copyList");

function getItems() {
    let items = document.querySelectorAll("#auc-minicart-panel > div.auc-panel__content > div")
    let res = []
    let i = 1
    items.forEach(item => {
        let url = item.querySelector('#auc-minicart-panel > div.auc-panel__content > div:nth-child(' + i + ') > div.card-body.p-0 > div > div > div.col.auc-card__info > div.col.p-0.auc-card__info--name > a').href
        let qtd = item.querySelector('#auc-minicart-panel > div.auc-panel__content > div:nth-child(' + i + ') > div.card-footer.row.no-gutters.align-items-center > div.col-7 > div > div.auc-qty-selector__container > div > input').value
        res.push({ 'url': url, 'qtd': qtd })
        i++
    })

    return res
}

const getCart = async() => {
    const tab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0]
    chrome.webNavigation
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: getItems
    }, (injectionResults) => {
        if (resList.innerHTML != "") resList.innerHTML = ""
        for (let injectionResult of injectionResults)
            for (let item of injectionResult.result) {
                resList.innerHTML += item.qtd + " * " + item.url + "\n"
            }
    });
}

const copyList = () => {
    navigator.clipboard.writeText(resList.innerHTML);
}

getListButton.onclick = getCart
copyListButton.onclick = copyList
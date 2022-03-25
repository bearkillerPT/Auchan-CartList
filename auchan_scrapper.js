const resList = document.getElementById('resList')
const getListButton = document.getElementById("getList");
const copyListButton = document.getElementById("copyList");
const addToCartButton = document.getElementById("addToCart");

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
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: getItems
    }, (injectionResults) => {
        if (resList.value != "")
            resList.value = ""

        for (let injectionResult of injectionResults)
            for (let item of injectionResult.result) {
                resList.value += item.qtd + " * " + item.url + "\n"
            }
        resList.value = resList.value.slice(0, -1)
    });
}

const copyList = () => {
    navigator.clipboard.writeText(resList.value);
}

const addItem = async() => {
    let addButton = document.querySelector('#maincontent > div.container.product-detail.product-wrapper.auc-pdp__body > div.row.no-gutters.auc-pdp__upper-section.auc-pdp__upper-section--grocery > div.col-12.col-md-7.col-xl-6.auc-pdp__right-section > div > div.auc-pdp__middle-section.row.no-gutters > div.prices-add-to-cart-actions.col-12.col-xl-5 > div > div > div > div > button')
    addButton.click()
}
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}
const changeQtd = async(qtd) => {
    let qtdDiv = document.querySelector('#maincontent > div.container.product-detail.product-wrapper.auc-pdp__body > div.row.no-gutters.auc-pdp__upper-section.auc-pdp__upper-section--grocery > div.col-12.col-md-7.col-xl-6.auc-pdp__right-section > div > div.auc-pdp__middle-section.row.no-gutters > div.prices-add-to-cart-actions.col-12.col-xl-5 > div > div > div > div > div.auc-qty-selector__container > div > input')
    if (parseInt(qtdDiv.value) != 1)
        qtdDiv.value = parseInt(qtdDiv.value) + parseInt(qtd)
    else
        qtdDiv.value = qtd
    qtdDiv.dispatchEvent(new Event('change'));
}

const isLoaded = () => {
    let addItemButton = !!document.querySelector('#maincontent > div.container.product-detail.product-wrapper.auc-pdp__body > div.row.no-gutters.auc-pdp__upper-section.auc-pdp__upper-section--grocery > div.col-12.col-md-7.col-xl-6.auc-pdp__right-section > div > div.auc-pdp__middle-section.row.no-gutters > div.prices-add-to-cart-actions.col-12.col-xl-5 > div > div > div > div > button')
    let chngQtdButton = !!document.querySelector('#maincontent > div.container.product-detail.product-wrapper.auc-pdp__body > div.row.no-gutters.auc-pdp__upper-section.auc-pdp__upper-section--grocery > div.col-12.col-md-7.col-xl-6.auc-pdp__right-section > div > div.auc-pdp__middle-section.row.no-gutters > div.prices-add-to-cart-actions.col-12.col-xl-5 > div > div > div > div > div.auc-qty-selector__container > div > input')
    return addItemButton || chngQtdButton
}

const addToCart = async() => {
    const tab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0]
    let listText = resList.value;
    let cart = listText.split('\n')
    for (let item of cart) {
        let values = item.split(' * ')
        let qtd = values[0]
        let url = values[1]
        chrome.tabs.update(tab.id, {
            url: url
        })
        let hasLoaded = false
        while (!hasLoaded) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: isLoaded
            }, (injectionResults) => {
                if (resList.value != "")
                    resList.value = ""

                for (let injectionResult of injectionResults)
                    hasLoaded = injectionResult.result
            })
            await sleep(250)
        }
        await sleep(400)

        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: addItem
        });
        await sleep(400)
        if (qtd != 1)
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: changeQtd,
                args: [qtd]
            });
        await sleep(400)

    }
}
getListButton.onclick = getCart
copyListButton.onclick = copyList
addToCartButton.onclick = addToCart
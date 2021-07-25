const { ParaSwap } = require('paraswap')
const BN = require('bignumber.js')

let paraSwap = new Map()
let tokens =  new Map()
let defExch =  new Map()

let initiailized = false

async function initPara() {
    paraSwap.set('ethereum',new ParaSwap(1))
    paraSwap.set('polygon',new ParaSwap(137))
    paraSwap.set('binance',new ParaSwap(56))
    tokens.set('ethereum', await paraSwap.get('ethereum').getTokens())
    tokens.set('polygon', await paraSwap.get('polygon').getTokens())
    tokens.set('binance', await paraSwap.get('binance').getTokens())
    
    defExch.set('ethereum','UniswapV2')
    defExch.set('polygon','QuickSwap')
    defExch.set('binance','PancakeSwapV2')
    initiailized = true
}

function isInitiailized() {return initiailized}

function findTkn(symbol, chain) {
    let res = tokens.get(chain).filter(item => item.symbol === symbol)
    if (res.length > 0) {
        return res[0]
    }
    else return null
}

function denomToUnit(amt, tkn) {
    // amt is string, returns string
    let unit = (BN(amt)).div(BN(10).pow(BN(tkn.decimals)))
    return unit.toString()
}

function unitToDenom(amt, tkn) {
    // amt is string, returns string
    let unit = (BN(amt)).times(BN(10).pow(BN(tkn.decimals)))
    return unit.toFixed(0).toString()
}

async function getRate(fromTkn, toTkn, amt, chain) {
// tokens are passed using the full object, amt is in from tkn denom

    const quote = await paraSwap.get(chain).getRate(fromTkn.address, toTkn.address, unitToDenom(amt, fromTkn))
    //{price, bestRoute (dex or mulit), defRoutePrice, multi if applicable}
    let price = denomToUnit(quote.details.srcAmount, fromTkn) / denomToUnit(quote.details.destAmount, toTkn) 
    let bestRoute = quote.bestRoute.reduce((acc,item) => {return acc + `${item.exchange}:${parseFloat(item.percent).toFixed(0)}% `}, '')

    let defPrice = 0
    let defRoute = ''
    let defQuote = quote.others.filter(item => item.exchange === defExch.get(chain))
    if (defQuote.length > 0) {
        defPrice = denomToUnit(quote.details.srcAmount, fromTkn) / denomToUnit(defQuote[0].rateFeeDeducted, toTkn) 
        defRoute = defExch.get(chain)
    }
    return {price, bestRoute, defPrice, defRoute}
}

async function getBidAsk(fromTkn, toTkn, amt, chain) {
    // tokens are passed using the full object, amt is in from tkn denom

    // First get the Bid
    let ask = await getRate(fromTkn, toTkn, amt, chain)
    // then get the ask
    let bidAmt = amt / ask.price
    let bid = await getRate(toTkn, fromTkn, bidAmt, chain)
    bid = {...bid, price:1/bid.price, defPrice:1/bid.defPrice}
    let spread = ((ask.price - bid.price) / ((ask.price + bid.price) /2) * 10000).toFixed(0)
    let defSpread = ((ask.defPrice - bid.defPrice) / ((ask.defPrice + bid.defPrice) /2) * 10000).toFixed(0)
    let buySave = (1/ask.price - 1/ask.defPrice) * amt *(ask.price)
    let sellSave = (1/bid.defPrice - 1/bid.price) * amt*(bid.price)

    return {fromTkn, toTkn, amt, bid, ask, spread, defSpread, buySave, sellSave, defRoute:defExch.get(chain), chain }
}

export {findTkn, initPara, getRate, getBidAsk, isInitiailized}

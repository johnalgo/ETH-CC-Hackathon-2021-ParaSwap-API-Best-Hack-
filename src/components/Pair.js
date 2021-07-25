import React, { useState, useEffect } from 'react'
import para from './para'
import './pair.css'

export default function Pair({ loading, req }) {

  // req:{fromTkn, toTkn, amt, chain}
  // Use the useTable Hook to send the columns and data to build the table
  // create a default empty res
  const defTkn = {address:'', decimals: 0, symbol: '', tokenType: '', mainConnector: '', connectors: [ ], network: 0, img: '', allowance: 0, balance: 0 }  
  const defRes = { fromTkn: defTkn,toTkn: defTkn,amt: 0, bid: {price:0, bestRoute:'', defPrice:0, defRoute:''}, ask: {price:0, bestRoute:'', defPrice:0, defRoute:''}, spread: 0, defSpread: 0, buySave: 0, sellSave: 0, defRoute:'', chain:''}

  const[resData, setResData] = useState(defRes)
  const[refresh, setRefresh] = useState(false)
  
  const numFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 })


  async function getBidAsk() {
    if (!loading) {
      setResData(resData => {return {...resData, chain:'fetching ...'}})
      try {      
        let res = await para.getBidAsk(req.fromTkn, req.toTkn, req.amt, req.chain)
        setResData(res)
      } catch(e) {console.log(e)}
    }
  }
  useEffect(() => {
    if (!loading) {
      getBidAsk()
    }
  }, [loading]);

  useEffect(() => {
    getBidAsk()
    let interval = setInterval(()=> setRefresh(refresh => refresh + 1), 30000)
    return () => clearInterval(interval)
  },[refresh])

  return (
    <div >
      <div  className="pair-container-route">
        <div className="pair-tkn"> {resData.fromTkn.symbol} </div>
        <div className="pair-logo"> <img src={resData.fromTkn.img} alt="" height="20px" /> </div>
        <div className="pair-tkn"> {resData.toTkn.symbol}</div>
        <div className="pair-logo"> <img src={resData.toTkn.img} alt="" height="20px" /> </div>
        <div className="pair-amt">  {resData.amt} </div>
        <div className="pair-price">  {numFormat.format(resData.bid.price)} </div>
        <div className="pair-route">  {resData.bid.bestRoute} </div>
        <div className="pair-price">  {numFormat.format(resData.ask.price)} </div>
        <div className="pair-route">  {resData.ask.bestRoute} </div>
        <div className="pair-bps">  {resData.spread} </div>
        <div className="pair-price">  {numFormat.format(resData.buySave)} </div>
        <div className="pair-price">  {numFormat.format(resData.sellSave)} </div>
      </div>
      <div className="pair-container-default" >
        <div className="pair-default"> {resData.chain} : default:{resData.defRoute} </div>
        <div className="pair-price">  {numFormat.format(resData.bid.defPrice)} </div>
        <div className="pair-route">  </div>
        <div className="pair-price">  {numFormat.format(resData.ask.defPrice)} </div>
        <div className="pair-route">  </div>
        <div className="pair-bps">  {resData.defSpread} </div>
        <div className="pair-price">  {numFormat.format(resData.buySave)} </div>
        <div className="pair-price">  {numFormat.format(resData.sellSave)} </div>
      </div>
    </div>      
  )
}
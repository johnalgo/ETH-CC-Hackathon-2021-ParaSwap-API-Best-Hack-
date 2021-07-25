import React, { useState, useEffect } from 'react'
import './pair.css'
import Pair from './Pair'
import * as para from './para.js'

export default function PairCollection() {

  const defTkn = {address:'', decimals: 0, symbol: '', tokenType: '', mainConnector: '', connectors: [ ], network: 0, img: '', allowance: 0, balance: 0 }  

  const[reqData, setReqData] = useState([])
  const [newReq, setNewReq] = useState({fromTkn:defTkn, toTkn:defTkn, amt:0, chain:'ethereum'})

  useEffect(() => { 
    (async () => {
      await para.initPara()
      //setReqData([{fromTkn:para.findTkn('USDT','ethereum'), toTkn:para.findTkn('ETH','ethereum'), amt:'1000' ,chain:'ethereum'}])
    })();
  }, []);

    function hdlFromTkn(event) {
        let inStr = event.target.value
        let tkn = para.findTkn(inStr, newReq.chain)
        if (tkn !== null) setNewReq({ ...newReq, fromTkn: tkn })
        else setNewReq({ ...newReq, fromTkn: { ...newReq.fromTkn, symbol: inStr } })
    }

    function hdlToTkn(event) {
        let inStr = event.target.value
        let tkn = para.findTkn(inStr, newReq.chain)
        if (tkn !== null) setNewReq({ ...newReq, toTkn: tkn })
        else setNewReq({ ...newReq, toTkn: { ...newReq.fromTkn, symbol: inStr } })
    }

    function hdlAmtChange(event) {
        let inStr = event.target.value
        if (!isNaN(inStr)) {
            setNewReq({ ...newReq, amt: inStr })
        }
    }
    function isValid(theReq) {
        if (theReq.fromTkn.address !== '' && theReq.toTkn.address !== '' && theReq.amt > 0 && theReq.chain !== '') return true
        else return false
    }
  function addButtonClick () {
    if (isValid(newReq)) setReqData(reqData => reqData.concat(newReq))
  }

  function clearButtonClick () {
    if (isValid(newReq)) setReqData([])
  }

  function chainSelect(event){
	let val = event.target.value
	//let dataset = e.target.options[idx].dataset
/*
    let newFromTkn = newReq.fromTkn
    let newToTkn = newReq.toTkn
    let fromTkn = para.findTkn(newReq.fromTkn.symbol, val)
    let toTkn = para.findTkn(newReq.toTkn.symbol, val)
    if (fromTkn !== null) newFromTkn = fromTkn
    if (toTkn !== null) newToTkn = toTkn
*/    
    setNewReq({ ...newReq, fromTkn:defTkn, toTkn:defTkn, amt:0, chain: val })
}

  return (
    <div>
      <div className="pair-collection-add" >
        <div className="pair-coll-add-button"><button onClick={clearButtonClick}> clearAll </button></div>
      </div>

      <div className="pair-collection-add" >
        <div className="pair-coll-add-label"><label>Sell: </label></div>
        <div className="pair-coll-add-input"><input type="text" value={newReq.fromTkn.symbol} onChange={hdlFromTkn} size="7" /></div>
        <div className="pair-coll-add-label"><img src={newReq.fromTkn.img} alt="" height="20px" /></div>
        <div className="pair-coll-add-label"><label>Buy: </label></div>
        <div className="pair-coll-add-input"><input type="text" value={newReq.toTkn.symbol} onChange={hdlToTkn} size="7" /></div>
        <div className="pair-coll-add-label"><img src={newReq.toTkn.img} alt="" height="20px" /></div>
        <div className="pair-coll-add-label"><label>Amt: </label></div>
        <div className="pair-coll-add-input"><input type="text" value={newReq.amt} onChange={hdlAmtChange} size="9" /></div>
        <div className="pair-coll-add-select"><select onChange={chainSelect}> {newReq.chain}}
            <option value='ethereum'>ethereum</option> 
            <option value='polygon'>polygon</option>
            <option value='binance'>binance</option>
        </select></div>
        <div className="pair-coll-add-button"><button onClick={addButtonClick}> Add </button></div>
      </div>
      <div className="pair-container-header" >
        <div className="pair-tkn"> Sell </div>
        <div className="pair-logo">  </div>
        <div className="pair-tkn">  Buy </div>
        <div className="pair-logo">  </div>
        <div className="pair-amt">  Amount </div>
        <div className="pair-price"> Best Bid </div>
        <div className="pair-route">  Bid Route </div>
        <div className="pair-price"> Best Ask </div>
        <div className="pair-route"> Ask Route </div>
        <div className="pair-bps"> Spread </div>
        <div className="pair-price"> Buy Savings </div>
        <div className="pair-price"> Sell Savings </div>
      </div>
      <div>
    {reqData.map(item => 
      <Pair key={item.fromTkn.symbol+item.toTkn.symbol+item.amt.toString()+item.chain} req={item} />
    )}
    </div>    
    </div>
  )
}
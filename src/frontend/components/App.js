import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom"
import './App.css';

import { useState, useEffect, useRef } from 'react'
import { Image, Row, Col, Button } from 'react-bootstrap'
import { ethers } from 'ethers'

import NFTAbi from '../contractsData/NFT.json'
import NFTAddress from '../contractsData/NFT-address.json'
import configContract from "./configContract.json";
import logo from './assets/Logo.svg'

const fromWei = (num) => ethers.utils.formatEther(num)
const toWei = (num) => ethers.utils.parseEther(num.toString())

const totalSupply = 4444
const collectionSlug = "block-beggars"

function App() {
  const [account, setAccount] = useState(null)
  const [balance, setBalance] = useState(0)
  const [supplyLeft, setSupplyLeft] = useState(totalSupply)
  const [nft, setNFT] = useState({})
  const [justMinted, setJustMinted] = useState(false)
  const [quantity, setQuantity] = useState(1)

  const buttonLinkOnClick = async (elementId) => {
    console.log("buttonLinkOnClick: " + elementId)
    var ex = document.getElementById(elementId);
    ex.click();
  }

  const changeQuantity = (direction) => {
      if (quantity + direction < 1)
          setQuantity(1)
      else if (quantity + direction > 2)
          setQuantity(2)
      else
          setQuantity(quantity + direction)
  }

  const mintButton = async () => {
      console.log("mint button", quantity)
      await (await nft.mint(quantity)).wait()
      setBalance(balance + quantity)
      setJustMinted(true)
  }

  const web3Handler = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

    await loadContracts(accounts[0])
    
    setAccount(accounts[0])
  }

  const loadOpenSeaItems = async () => {
    let stats = await fetch(`${configContract.OPENSEA_API}/collection/${collectionSlug}`)
    .then((res) => res.json())
    .then((res) => {
      console.log(res)
      return res.collection.stats
    })
    .catch((e) => {
      console.error(e)
      console.error('Could not talk to OpenSea')
      return null
    })

    setSupplyLeft(totalSupply - stats.count)
  }

  const loadContracts = async (acc) => {
    console.log("loadContracts")
    const providerTemp = new ethers.providers.Web3Provider(window.ethereum)
    const signer = providerTemp.getSigner()

    const nft = new ethers.Contract(NFTAddress.address, NFTAbi.abi, signer)
    const balanceTemp = parseInt(await nft.balanceOf(acc))
    console.log("balance", balanceTemp)
    setBalance(balanceTemp)
    setNFT(nft)

    console.log("nft address: " + nft.address)
  }
  

  useEffect(() => {
    loadOpenSeaItems()
  }, [])

  return (
    <BrowserRouter>
      <div className="App" id="wrapper">
        <div className="m-0 p-0 container-fluid">
          <div className="logoDiv"> <Image src={logo} className = "logo" /> </div>
          <Row className="popup">
            {account == null ? (
              <Row className="m-0 p-0">
              <div>
                Mint Beggars For Free
                <br/>MAXIMUM 2 BEGGARS PER WALLET
              </div>
              <div>
                {supplyLeft}/4444
                <br/>BEGGARS REMAINING
              </div>
                <div className="mintButton" onClick={web3Handler}>
                  Connect Wallet
                </div>
              </Row>
            ) : (
              !(justMinted || balance >= 2) ? (
                <Row className="m-0 p-0">
                  <div>
                    Mint Beggars For Free
                    <br/>MAXIMUM 2 BEGGARS PER WALLET
                  </div>
                  <div>
                  {supplyLeft}/4444
                    <br/>BEGGARS REMAINING
                  </div>
                  <div className="quantitySelector">
                      <span className="buttonQuantity" onClick={() => changeQuantity(-1)}>-</span>
                      <span className="quantity">{quantity}</span>
                      <span className="buttonQuantity" onClick={() => changeQuantity(1)}>+</span>
                  </div>
                  <div className="mintButton" onClick={mintButton}>
                    Mint
                  </div>
                  <div>
                    {account.slice(0, 9) + '...' + account.slice(34, 42)}
                  </div>
                </Row>
              ) : (
                <Row className="m-0 p-0">
                  <div className="px-2">
                    SUCCESSFULLY MINTED!<br/>Congratulations ON BECOMING A BEGGAR!
                  </div>
                  <div className="mintButton" onClick={() => buttonLinkOnClick('twitterLink')} >
                    Twitter
                    <a href="https://twitter.com/BlockBeggars" target="_blank" id="twitterLink"></a>
                  </div>
                  <div className="mintButton" onClick={() => buttonLinkOnClick('discordLink')} >
                    Discord
                    <a href="https://discord.gg/blockbeggars" target="_blank" id="discordLink"></a>
                  </div>
                  <div className="mintButton" onClick={() => buttonLinkOnClick('openseaLink')} >
                    OpenSea
                    <a href="https://opensea.io/collection/block-beggars" target="_blank" id="openseaLink"></a>
                  </div>
                  <div>
                    {account.slice(0, 9) + '...' + account.slice(34, 42)}
                  </div>
                </Row>
              )
            )}
          </Row>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;

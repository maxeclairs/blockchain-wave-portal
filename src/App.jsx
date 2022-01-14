import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/WavePortal.json';

export default function App() {

  // state variable to store the our user's public wallet

  const [currentAccount, setCurrentAccount] = useState("");

  const [allWaves, setAllWaves] = useState([]);

  const [message, setMessage] = useState("");

  const contractAddress = '0xF65705b2cD3A4C87bF05dFFc24d94b9715cd5762';

  const contractABI = abi.abi;

  // create a method to get all the waves from the contract
  const getAllWaves = async () => {
    try{
      const { ethereum } = window;

      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        // call the getAllWaves function from the contract

        const waves = await wavePortalContract.getAllWaves();

        // let's pick address, timestamp and messages from the waves to display in UI

        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        // store data in React state
        setAllWaves(wavesCleaned);

      }else{
        console.log("Ethereum object not found.");
      }

    }catch(error){
      console.log(error);
    }
  };

  // listen for emitter events
  useEffect(() => {
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave: ", from, timestamp, message);

      setAllWaves(prevState => [...prevState,
        {address: from,
        timestamp: new Date(timestamp * 1000),
        message: message,
        },

      ]);
    };

    if(window.ethereum){
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      
      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      wavePortalContract.on("NewWave", onNewWave);
    }

    return () => { 
       if(wavePortalContract){
        wavePortalContract.off("NewWave", onNewWave);
      }
    };

  }, []);

  // check if wallet is connected
  const checkIfWalletIsConnected = async () => {
    //first check if windows.etherium is accessible

    try {   

      const { ethereum } = window;

      if( !ethereum ){
        console.log("Metamask wallet is not connected!");
        return;
      }else{
        console.log("We have ethereum object", ethereum);
      }

      // check if we are authorized to access user's wallet
      const accounts = await ethereum.request({ method: "eth_accounts" });
      
      if (accounts.length != 0) {
        const account = accounts[0];
        console.log("Found an account!", account);
        setCurrentAccount(account);

        // call getAllWaves function after we check if the user is 
        // connected and authorized
        // getAllWaves();
      }else{
        console.log("No authorised account found!");
      }

    } catch (error){
      console.log(error);
    }
  
  }

  // connect wallet code
  const connectWallet = async () => {
    try{
      const { ethereum } = window;

      if(!ethereum){
        console.log("Get Metamask")
      return;
      }

        const accounts = await ethereum.request( { method : "eth_requestAccounts" } );
        console.log("Connected", accounts[0]);
        setCurrentAccount(accounts[0]);
    }catch(error){
      console.log(error);
    }
  }


  // this runs the function on page load
  useEffect( () => {
    checkIfWalletIsConnected();
    getAllWaves();
  }, [])

  const wave = async () => {
    try{
      const { ethereum } = window;

      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total waves: ", count.toNumber());

        const waveTxn = await wavePortalContract.wave(message, {gasLimit: 300000});
        console.log("Mining...", waveTxn.hash)

        await waveTxn.wait();

        console.log("Mined -- ", waveTxn.hash)

        count = await wavePortalContract.getTotalWaves();
        console.log("Total Waves after mining: ", count.toNumber())

      }else{
        console.log("Ethereum object not found.");
      }

    }catch(error){
      console.log(error);
    }
  }
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hey folks!
        </div>

        <div className="bio">
        I am Akhilesh and I am learning blockchain and trying to build DApps? Connect your Ethereum wallet and wave at me!
        </div>
        <input type="text" className="message" value={message} 
        placeholder="Send me a message with the wave"
        onChange = {(e)=>setMessage(e.target.value)}
        />

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
          Connect Wallet
          </button>
        )}

        {
          allWaves.map((wave, index) => {
            return(
              <div key={index} style={{backgroundColor: "cyan", marginTop: "16px", padding: "8px" }}>
                <div>Address: {wave.address}</div>
                <div>Time: {wave.timestamp.toString()}</div>
                <div>Message: {wave.message}</div>
              </div>)
          })
        }
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// Components
import Navigation from './components/Navigation';
import Search from './components/Search';
import Home from './components/Home';

// ABIs
import RealEstate from './abis/RealEstate.json'
import Escrow from './abis/Escrow.json'

// Config
import config from './config.json';

function App() {
  const [account,setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [escrow, setEscrow] = useState(null);
  const [homes,setHomes]= useState([]);
  const [home, setHome] = useState(null);
  const [toggle, setToggle] = useState(false);


  const loadBlockchainData = async()=>{
    if(typeof window.ethereum === "undefined"){
      alert("Please install metamask");
    }
    else{
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);
      //On account change automatically update the account
      const network = await provider.getNetwork();
      
      const realEstate = await new ethers.Contract(config[network.chainId].realEstate.address, RealEstate, provider);
      
      const totalSupply = await realEstate.totalSupply();
      
      const homesArray=[];
      
      for(var i=0; i<totalSupply; i++){
        const uri = await realEstate.tokenURI(i+1);
        const res = await fetch(uri);
        const metadata = await res.json();
        homesArray.push(metadata);
      }
      await setHomes(homesArray);

      const escrow = await new ethers.Contract(config[network.chainId].escrow.address, Escrow, provider);
      setEscrow(escrow);

      window.ethereum.on("accountsChanged", async() =>{
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = ethers.utils.getAddress(accounts[0])
        setAccount(account); 
        console.log(account);
        
      }) 
      
    }


  }
  useEffect(()=>{
    loadBlockchainData();
  },[])

  const togglePop=async(home)=>{
    console.log(home);
    setToggle(true);
  }

  return (
    <div>
      <Navigation account={account} setAccount={setAccount}/>
      <Search/>

      <div className='cards__section'>

        <h3>Homes For You</h3>

        <hr />

        <div className='cards'>
          {homes.map((home, index) => (
            <div className='card' key={index} onClick={()=> togglePop(home) }>
              <div className='card__image'>
                <img src={home.image} alt="Home" />
              </div>
              <div className='card__info'>
                <h4>{home.attributes[0].value} ETH</h4>
                <p>
                  <strong>{home.attributes[2].value}</strong> bds |
                  <strong>{home.attributes[3].value}</strong> ba |
                  <strong>{home.attributes[4].value}</strong> sqft
                </p>
                <p>{home.address}</p>
              </div>
            </div>
          ))}
        </div>

      </div>

    {toggle && (
      <Home home={home} provider={provider} account={account} escrow={escrow} togglePop={togglePop} />
    )}

    </div>
  ); 
}

export default App;

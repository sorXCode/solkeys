import { useEffect, useState } from "react";
import PrimaryButton from "../components/primary-button";
import abi from "../utils/Keyboards.json";
import {ethers} from "ethers";

export default function Home() {
  const [ethereum, setEthereum] = useState(undefined);
  const [connectedAccount, setConnectedAccount] = useState(undefined);
  const [keyboards, setKeyboards] = useState([]);
  const [newKeyboard, setNewKeyboard] = useState("");

  const contractAddress = "0x4986F6c8c8e06B6742dC10e921147021887729f5"
  const contractABI= abi.abi

  const handleAccounts = (accounts) =>{
    if (accounts.length > 0){
      const account = accounts[0];
      console.log("We have an authorized account: ", account);
      setConnectedAccount(account);
    } else {
      console.log("No Account was authorized");
    }
  }

  const getConnectedAccount = async () => {
    if (window.ethereum){
      setEthereum(window.ethereum);
    }
    if (ethereum){
      const accounts = await ethereum.request({method: "eth_accounts"});
      handleAccounts(accounts)
    }
  }

  useEffect(() => getConnectedAccount());

  const connectAccount = async () => {
    if (!ethereum){
      alert('MetaMask is required to connect an account');
      return;
    }

    const accounts = await ethereum.request({method: "eth_requestAccounts"})
    handleAccounts(accounts);
  }

  const getKeyboardContract = () => {
    
  }
  const getKeyboards = async () => {
    if (ethereum && connectedAccount){
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();

      const keyboardsContract = new ethers.Contract(contractAddress, contractABI, signer);
      const keyboards = await keyboardsContract.getKeyboards();

      console.log('Retrieved keyboards: ', keyboards);
      setKeyboards(keyboards);
    }
  }

  const submitCreate = async (e) => {
    e.preventDefault();
    if (!ethereum){
      console.error("Ethereum object is required to create a keyboard");
      return;
    }
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();

    const keyboardsContract = new ethers.Contract(contractAddress, contractABI, signer);
  
    const createTxn = await keyboardsContract.create(newKeyboard);
    console.log('Creating transaction for new keyboard ', createTxn.hash);

    await createTxn.wait();
    console.log('Created Keyboard ', createTxn.hash);

    getKeyboards();

  }

  useEffect(() => getKeyboards(), [connectedAccount])



  if (!ethereum) {
    return <p>Please install MetaMask to connect to this site</p>
  }

  if (!connectedAccount){
    return <PrimaryButton onClick={connectAccount}>Connect MetaMask Wallet</PrimaryButton>
  }
  return (
    <div className="flex flex-col gap-y-8">
      <div><p>Connected to: {connectedAccount}</p></div>
      <form className="flex flex-col gap-y-2">
        <div>
          <label htmlFor="keyboard-description" className="block text-sm font-medium text-gray-700">
            Keyboard Description
          </label>
        </div>
        <input
          name="keyboard-type"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          value={newKeyboard}
          onChange={(e) => { setNewKeyboard(e.target.value) }}
        />
        <PrimaryButton type="submit" onClick={submitCreate}>
          Create Keyboard!
        </PrimaryButton>
      </form>
      <div>{keyboards.map((keyboard, i) => <p key={i}>{keyboard}</p>)}</div>
    </div>
  )

}
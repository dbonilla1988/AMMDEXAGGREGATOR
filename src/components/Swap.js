
 import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import { ethers } from 'ethers';


import Alert from './Alert';
import config from '../config.json';


import { swap, loadBalances } from '../store/interactions';


import AMM_ABI from '../abis/AMM.json';
import Aggregator_ABI from '../abis/Aggregator.json';


// Dex Aggregator component
const DexAggregator = ({ amm1Contract, amm2Contract }) => {
  const [priceFromAmm1, setPriceFromAmm1] = useState(0);
  const [priceFromAmm2, setPriceFromAmm2] = useState(0);
  const [bestPrice, setBestPrice] = useState(null);


  const fetchPrices = useCallback(async () => {
    if (amm1Contract && amm2Contract) {
      try {
        const priceFromAmm1 = await amm1Contract.getPrice(); // Implement getPrice method in your AMM contract
        const priceFromAmm2 = await amm2Contract.getPrice(); // Implement getPrice method in your AMM contract
        setPriceFromAmm1(priceFromAmm1);
        setPriceFromAmm2(priceFromAmm2);
        setBestPrice(Math.min(priceFromAmm1, priceFromAmm2));
      } catch (error) {
        console.error('Error fetching prices:', error);
      }
    }
  }, [amm1Contract, amm2Contract]);


  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]); // Fetch prices whenever AMM addresses change


  return (
    <div>
      <h1>Dex Aggregator</h1>
      <div>
        <h2>Price Comparison:</h2>
        <p>Price from AMM #1: {priceFromAmm1}</p>
        <p>Price from AMM #2: {priceFromAmm2}</p>
        {bestPrice !== null && (
          <p>Best Price: {bestPrice}</p>
        )}
      </div>
    </div>
  );
};


const Swap = () => {
  const [inputToken, setInputToken] = useState(null);
  const [outputToken, setOutputToken] = useState(null);
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [price, setPrice] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [amm1Address, setAmm1Address] = useState(null); // Define state variable for AMM1 address
  const [amm2Address, setAmm2Address] = useState(null); // Define state variable for AMM2 address


  const dispatch = useDispatch();
  const provider = useSelector(state => state.provider.connection);
  const account = useSelector(state => state.provider.account);
  const tokens = useSelector(state => state.tokens.contracts);
  const balances = useSelector(state => state.tokens.balances);
  const isSwapping = useSelector(state => state.amm.swapping.isSwapping);
  const isSuccess = useSelector(state => state.amm.swapping.isSuccess);
  const transactionHash = useSelector(state => state.amm.swapping.transactionHash);


// New: Accessing AMM balances using useSelector
 // New: Accessing AMM balances using useSelector
const defaultAmmBalances = { token1Balance: 0, token2Balance: 0 }; // Adjust structure as needed
const amm1Balances = useSelector(state => state.tokens.balances?.amm1 || defaultAmmBalances);
const amm2Balances = useSelector(state => state.tokens.balances?.amm2 || defaultAmmBalances);

const aggregatorAddress = config['31337'].aggregator.address;

const amm1Contract = useMemo(() => {
  if (!amm1Address || !provider) return null;
  return new ethers.Contract(amm1Address, AMM_ABI, provider);
}, [amm1Address, provider]);

const amm2Contract = useMemo(() => {
  if (!amm2Address || !provider) return null;
  return new ethers.Contract(amm2Address, AMM_ABI, provider);
}, [amm2Address, provider]);

const aggregatorContract = useMemo(() => provider ? new ethers.Contract(aggregatorAddress, Aggregator_ABI, provider) : null, [aggregatorAddress, provider]);

const inputHandler = (e) => {
  setInputAmount(e.target.value);
  calculateOutputAmount(e.target.value);
  console.log('Input Token:', inputToken); // Add this line
};

const swapHandler = async (e) => {
  e.preventDefault();
  setShowAlert(false);

  if (!inputToken || !outputToken || inputAmount <= 0) {
    window.alert('Please select tokens and enter a valid input amount.');
    return;
  }

  const inputAmountWei = ethers.utils.parseUnits(inputAmount, 'ether');

  // Initiating the swap operation
  await swap(provider, amm1Contract, amm2Contract, aggregatorContract, tokens[inputToken === 'DAPP' ? 0 : 1], inputToken, inputAmountWei, dispatch);

  // Awaiting the balances to be loaded
  await loadBalances(provider, amm1Contract, amm2Contract, tokens, account, dispatch);

  // The state update from loadBalances might not be reflected immediately because Redux actions are asynchronous
  // Consider using a useEffect hook to listen for changes to the Redux state and then perform actions based on that.
  
  await getPrice(); // Ensure this is needed here, and consider any dependencies it might have on updated balances

  setShowAlert(true);
};


  const processPriceData = useCallback((priceData) => {
    return priceData && priceData.price ? priceData.price : 0;
  }, []);


  const getPrice = useCallback(async () => {
    if (!aggregatorContract) return;


    try {
      const priceData = await aggregatorContract.getPriceData();
      const price = processPriceData(priceData);
      setPrice(price);
    } catch (error) {
      console.error('Error fetching price:', error);
    }
  }, [aggregatorContract, processPriceData]);


  const calculateOutputAmount = (inputAmount) => {
    // Your logic to calculate the output amount based on input amount and price
    // For example:
    const calculatedOutputAmount = inputAmount * price; // Replace this with your calculation logic
    setOutputAmount(calculatedOutputAmount.toFixed(2)); // Assuming you want to round output amount to 2 decimal places
  };


  useEffect(() => {
    getPrice();
  }, [getPrice]);
 
return (
  <div>
    <Card style={{ maxWidth: '450px' }} className='mx-auto px-4'>
      {account ? (
        <>
          <DexAggregator amm1Contract={amm1Contract} amm2Contract={amm2Contract} />
          <Form onSubmit={swapHandler} style={{ maxWidth: '450px', margin: '50px auto' }}>
            <Row className='my-3'>
              <div className='d-flex justify-content-between'>
                <Form.Label><strong>Input:</strong></Form.Label>  
                <Form.Text muted>Balance: {balances[inputToken]}</Form.Text> 
              </div>
              <InputGroup>
                <Form.Control
                  type="number"
                  placeholder="0.0"
                  min="0.0"
                  step="any"
                  value={inputAmount}
                  onChange={inputHandler}
                  disabled={!inputToken}
                />
                <DropdownButton
                  variant="outline-secondary"
                  title={inputToken ? inputToken : "Select Token"}
                  onSelect={(eventKey) => setInputToken(eventKey)}
                >
                  <Dropdown.Item eventKey="DAPP">DAPP</Dropdown.Item>
                  <Dropdown.Item eventKey="USD">USD</Dropdown.Item>
                </DropdownButton>
              </InputGroup>
            </Row>
            <Row className='my-4'>
              <div className='d-flex justify-content-between'>
                <Form.Label><strong>Output:</strong></Form.Label>
                <Form.Text muted>Balance: {balances && outputToken && balances[outputToken]}</Form.Text>
              </div>
              <InputGroup>
                <Form.Control
                  type="number"
                  placeholder="0.0"
                  value={outputAmount}
                  disabled
                />
                <DropdownButton
                  variant="outline-secondary"
                  title={outputToken ? outputToken : "Select Token"}
                  onSelect={(eventKey) => setOutputToken(eventKey)}
            


                >
                  <Dropdown.Item eventKey="DAPP">DAPP</Dropdown.Item>
                  <Dropdown.Item eventKey="USD">USD</Dropdown.Item>
                </DropdownButton>
              </InputGroup>
            </Row>
            <Row className='my-4'>
              <div className='d-flex justify-content-between'>
                <Form.Label><strong>Select AMM1:</strong></Form.Label>
              </div>
              <InputGroup>
                <DropdownButton
                  variant="outline-secondary"
                  title={amm1Address ? amm1Address : "Select AMM1"}
                  onSelect={(eventKey) => setAmm1Address(eventKey)}
                >
                  <Dropdown.Item eventKey={config['31337'].amm1.address}>{config['31337'].amm1.address}</Dropdown.Item>
                </DropdownButton>
              </InputGroup>
            </Row>
            <Row className='my-4'>
              <div className='d-flex justify-content-between'>
                <Form.Label><strong>Select AMM2:</strong></Form.Label>
              </div>
              <InputGroup>
                <DropdownButton
                  variant="outline-secondary"
                  title={amm2Address ? amm2Address : "Select AMM2"}
                  onSelect={(eventKey) => setAmm2Address(eventKey)}
                >
                  <Dropdown.Item eventKey={config['31337'].amm2.address}>{config['31337'].amm2.address}</Dropdown.Item>
                </DropdownButton>
              </InputGroup>
            </Row>
            {/* New section for displaying AMM Balances */}
            <Row className='my-4'>
              <div>
                <h3>AMM Balances</h3>
                <p>AMM1 Token1 Balance: {amm1Balances?.token1Balance}</p>
                <p>AMM1 Token2 Balance: {amm1Balances?.token2Balance}</p>
                <p>AMM2 Token1 Balance: {amm2Balances?.token1Balance}</p>
                <p>AMM2 Token2 Balance: {amm2Balances?.token2Balance}</p>
              </div>
            </Row>
            <Row className='my-3'>
              {isSwapping ? (
                <Spinner animation="border" style={{ display: 'block', margin: '0 auto' }} />
              ) : (
                <Button type='submit'>Swap</Button>
              )}
              <Form.Text muted>
                Exchange Rate: {price}
              </Form.Text>
            </Row>
          </Form>
        </>
      ) : (
        <p className='d-flex justify-content-center align-items-center' style={{ height: '300px' }}>
          Please connect wallet.
        </p>
      )}
    </Card>
    {isSwapping ? (
      <Alert
        message={'Swap Pending...'}
        transactionHash={null}
        variant={'info'}
        setShowAlert={setShowAlert}
      />
    ) : isSuccess && showAlert ? (
      <Alert
        message={'Swap Successful'}
        transactionHash={transactionHash}
        variant={'success'}
        setShowAlert={setShowAlert}
      />
    ) : !isSuccess && showAlert ? (
      <Alert
        message={'Swap Failed'}
        transactionHash={null}
        variant={'danger'}
        setShowAlert={setShowAlert}
      />
    ) : (
      <></>
    )}
  </div>
);


};


export default Swap;

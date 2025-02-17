import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ethers } from "ethers";
import {
  Box,
  Heading,
  Text,
  Button,
  Input,
  Select,
  Spinner,
  SimpleGrid
} from "@chakra-ui/react";

import Alert from "./Alert";
import config from "../config.json";
import { swap, loadBalances } from "../store/interactions";
import AMM_ABI from "../abis/AMM.json";
import Aggregator_ABI from "../abis/Aggregator.json";

// Hard-coded addresses (example only)
const DAPP_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const USD_ADDRESS  = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

function shortenAddress(addr) {
  if (!addr) return "";
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

// DexAggregator
const DexAggregator = ({ amm1Contract, amm2Contract }) => {
  const [priceFromAmm1, setPriceFromAmm1] = useState("0");
  const [priceFromAmm2, setPriceFromAmm2] = useState("0");
  const [bestPrice, setBestPrice] = useState(null);

  const fetchPrices = useCallback(async () => {
    if (!amm1Contract || !amm2Contract) return;
    try {
      const price1BN = await amm1Contract.getPrice(DAPP_ADDRESS, USD_ADDRESS);
      const price2BN = await amm2Contract.getPrice(DAPP_ADDRESS, USD_ADDRESS);

      const price1 = ethers.utils.formatUnits(price1BN, 18);
      const price2 = ethers.utils.formatUnits(price2BN, 18);

      setPriceFromAmm1(price1);
      setPriceFromAmm2(price2);

      const bestBN = price1BN.lt(price2BN) ? price1BN : price2BN;
      setBestPrice(ethers.utils.formatUnits(bestBN, 18));
    } catch (error) {
      console.error("Aggregator Error:", error);
    }
  }, [amm1Contract, amm2Contract]);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  // Hardcode aggregator card to dark theme
  return (
    <Box
      bg="gray.700"
      color="whiteAlpha.900"
      rounded="md"
      p={6}
      shadow="xl"
      mb={8}
    >
      <Heading size="md" mb={4}>Dex Aggregator</Heading>
      <Text><strong>Price from AMM #1:</strong> {priceFromAmm1}</Text>
      <Text><strong>Price from AMM #2:</strong> {priceFromAmm2}</Text>
      {bestPrice && (
        <Text mt={2}>
          <strong>Best Price:</strong> {bestPrice}
        </Text>
      )}
    </Box>
  );
};

// Swap
const Swap = () => {
  const dispatch = useDispatch();

  const [inputToken, setInputToken] = useState("");
  const [outputToken, setOutputToken] = useState("");
  const [inputAmount, setInputAmount] = useState("");
  const [outputAmount, setOutputAmount] = useState("");
  const [price, setPrice] = useState(0);
  const [showAlert, setShowAlert] = useState(false);

  // For the AMM addresses from dropdown
  const [amm1Address, setAmm1Address] = useState("");
  const [amm2Address, setAmm2Address] = useState("");

  // Redux
  const provider = useSelector((state) => state.provider.connection);
  const account = useSelector((state) => state.provider.account);
  const tokens = useSelector((state) => state.tokens.contracts);

  const aggregatorAddress = config["31337"]?.aggregator?.address || null;
  const isSwapping = useSelector((state) => state.amm.swapping?.isSwapping);
  const isSuccess = useSelector((state) => state.amm.swapping?.isSuccess);
  const transactionHash = useSelector((state) => state.amm.swapping?.transactionHash);

  // AMM1 contract
  const amm1Contract = useMemo(() => {
    if (!amm1Address || !provider) return null;
    return new ethers.Contract(amm1Address, AMM_ABI, provider);
  }, [amm1Address, provider]);

  // AMM2 contract
  const amm2Contract = useMemo(() => {
    if (!amm2Address || !provider) return null;
    return new ethers.Contract(amm2Address, AMM_ABI, provider);
  }, [amm2Address, provider]);

  // aggregator contract
  const aggregatorContract = useMemo(() => {
    if (!aggregatorAddress || !provider) return null;
    return new ethers.Contract(aggregatorAddress, Aggregator_ABI, provider);
  }, [aggregatorAddress, provider]);

  // fetch aggregator price
  const getPrice = useCallback(async () => {
    if (!aggregatorContract || !inputToken || !outputToken) return;

    const tokenInAddress = (inputToken === "DAPP")
      ? tokens.dappToken1Address
      : tokens.usdToken1Address;

    const tokenOutAddress = (outputToken === "DAPP")
      ? tokens.dappToken1Address
      : tokens.usdToken1Address;

    if (!tokenInAddress || !tokenOutAddress) return;
    try {
      const priceData = await aggregatorContract.getPriceData(tokenInAddress, tokenOutAddress);
      const parsed = parseFloat(ethers.utils.formatUnits(priceData, 18));
      setPrice(parsed);
    } catch (error) {
      console.error("Aggregator price error:", error);
    }
  }, [aggregatorContract, inputToken, outputToken, tokens]);

  useEffect(() => {
    getPrice();
  }, [getPrice]);

  // Basic output calculation
  const calcOutput = (val) => {
    if (!price || isNaN(price)) return;
    const res = parseFloat(val) * price;
    setOutputAmount(res ? res.toFixed(2) : "0.00");
  };

  const inputHandler = (e) => {
    setInputAmount(e.target.value);
    calcOutput(e.target.value);
  };

  const swapHandler = async (e) => {
    e.preventDefault();
    setShowAlert(false);

    if (!provider || !account) {
      window.alert("No wallet connected.");
      return;
    }
    if (!amm1Contract || !amm2Contract || !aggregatorContract) {
      window.alert("Select AMM1 and AMM2 addresses first.");
      return;
    }
    if (!inputToken || !outputToken || parseFloat(inputAmount) <= 0) {
      window.alert("Select tokens & valid input amount.");
      return;
    }

    const tokenInAddress = (inputToken === "DAPP")
      ? tokens.dappToken1Address
      : tokens.usdToken1Address;

    if (!tokenInAddress) {
      window.alert("Invalid input token address");
      return;
    }

    try {
      const inputAmountWei = ethers.utils.parseUnits(inputAmount, "ether");
      // aggregator-based swap
      await swap(
        provider,
        amm1Contract,
        amm2Contract,
        aggregatorContract,
        tokenInAddress,
        inputToken,
        inputAmountWei,
        dispatch
      );

      // Refresh balances + recalc aggregator price
      await loadBalances(provider, amm1Contract, amm2Contract, tokens, account, dispatch);
      await getPrice();
      setShowAlert(true);
    } catch (error) {
      console.error("Swap error:", error);
      setShowAlert(true);
    }
  };

  return (
    <Box minH="100vh" bg="gray.900" color="whiteAlpha.900" py={10} px={4}>
      <Box maxW="600px" mx="auto">
        {/* DexAggregator Card */}
        <DexAggregator amm1Contract={amm1Contract} amm2Contract={amm2Contract} />

        {/* Swap Card */}
        <Box bg="gray.800" p={6} rounded="md" shadow="xl">
          <Heading size="md" mb={4}>Swap</Heading>

          <form onSubmit={swapHandler}>
            {/* Input Row */}
            <Text fontWeight="bold" mb={1}>Input</Text>
            <SimpleGrid columns={[1, 2]} spacing={4} mb={4}>
              <Input
                placeholder="0.0"
                value={inputAmount}
                onChange={inputHandler}
                isDisabled={!inputToken}
                bg="gray.700"
                borderColor="gray.600"
              />
              <Select
                placeholder="Select Token"
                value={inputToken}
                onChange={(e) => {
                  setInputToken(e.target.value);
                  setInputAmount("");
                  setOutputAmount("");
                }}
                bg="gray.700"
                borderColor="gray.600"
              >
                <option style={{ color: "black" }} value="DAPP">DAPP</option>
                <option style={{ color: "black" }} value="USD">USD</option>
              </Select>
            </SimpleGrid>

            {/* Output Row */}
            <Text fontWeight="bold" mb={1}>Output</Text>
            <SimpleGrid columns={[1, 2]} spacing={4} mb={4}>
              <Input
                placeholder="0.0"
                value={outputAmount}
                isDisabled
                bg="gray.700"
                borderColor="gray.600"
              />
              <Select
                placeholder="Select Token"
                value={outputToken}
                onChange={(e) => {
                  setOutputToken(e.target.value);
                  setOutputAmount("");
                }}
                bg="gray.700"
                borderColor="gray.600"
              >
                <option style={{ color: "black" }} value="DAPP">DAPP</option>
                <option style={{ color: "black" }} value="USD">USD</option>
              </Select>
            </SimpleGrid>

            {/* AMM1 */}
            <Text fontWeight="bold" mb={1}>Select AMM1</Text>
            <Select
              placeholder="Select AMM1"
              bg="gray.700"
              borderColor="gray.600"
              mb={4}
              value={amm1Address}
              onChange={(e) => setAmm1Address(e.target.value)}
            >
              <option style={{ color: "black" }} value={config["31337"]?.amm1?.ammAddress}>
                {shortenAddress(config["31337"]?.amm1?.ammAddress)}
              </option>
            </Select>

            {/* AMM2 */}
            <Text fontWeight="bold" mb={1}>Select AMM2</Text>
            <Select
              placeholder="Select AMM2"
              bg="gray.700"
              borderColor="gray.600"
              mb={4}
              value={amm2Address}
              onChange={(e) => setAmm2Address(e.target.value)}
            >
              <option style={{ color: "black" }} value={config["31337"]?.amm2?.ammAddress}>
                {shortenAddress(config["31337"]?.amm2?.ammAddress)}
              </option>
            </Select>

            {/* Exchange Rate */}
            <Text fontWeight="bold">Exchange Rate</Text>
            <Text color="gray.300" fontSize="xl" mb={4}>
              {price ? price.toFixed(4) : "0.0000"}
            </Text>

            {/* Swap Button */}
            {isSwapping ? (
              <Spinner size="lg" mx="auto" display="block" />
            ) : (
              <Button
                type="submit"
                colorScheme="purple"
                w="full"
                size="lg"
                mt={2}
              >
                Swap
              </Button>
            )}
          </form>

          {/* Alerts */}
          {isSwapping ? (
            <Alert
              message="Swap Pending..."
              transactionHash={null}
              variant="info"
              setShowAlert={setShowAlert}
            />
          ) : isSuccess && showAlert ? (
            <Alert
              message="Swap Successful"
              transactionHash={transactionHash}
              variant="success"
              setShowAlert={setShowAlert}
            />
          ) : !isSuccess && showAlert ? (
            <Alert
              message="Swap Failed"
              transactionHash={null}
              variant="danger"
              setShowAlert={setShowAlert}
            />
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};

export default Swap;
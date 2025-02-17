      // src/components/Navigation.js
import { useSelector, useDispatch } from "react-redux";
import Navbar from "react-bootstrap/Navbar";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Blockies from "react-blockies";
import logo from "../logo.png";
import { connectProvider } from "../store/reducers/provider"; // The thunk
import config from "../config.json";

const Navigation = () => {
  const dispatch = useDispatch();

  // Removed `connection` and `error` to fix ESLint "unused vars" warnings.
  const { account, chainId, loading } = useSelector((state) => state.provider);

  const connectHandler = () => {
    if (!window.ethereum) {
      console.error("MetaMask not installed or window.ethereum missing.");
      return;
    }
    // If we haven't connected, dispatch the thunk
    dispatch(connectProvider());
  };

  const networkHandler = async (e) => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: e.target.value }],
      });
    } catch (error) {
      console.error("Network switch failed", error);
    }
  };

  return (
    <Navbar className="my-3 bg-light p-2" expand="lg">
      <Navbar.Brand href="#" className="d-flex align-items-center">
        <img
          alt="logo"
          src={logo}
          width="40"
          height="40"
          className="d-inline-block align-top mx-2"
        />
        <span>Davids AMM</span>
      </Navbar.Brand>

      <Navbar.Toggle aria-controls="nav" />

      <Navbar.Collapse id="nav" className="justify-content-end">
        <div className="d-flex align-items-center">
          <Form.Select
            aria-label="Network Selector"
            value={config[chainId] ? `0x${chainId?.toString(16)}` : "0"}
            onChange={networkHandler}
            style={{ maxWidth: "200px", marginRight: "20px" }}
          >
            <option value="0" disabled>
              Select Network
            </option>
            <option value="0x7A69">Localhost 31337</option>
            <option value="0x5">Goerli</option>
          </Form.Select>

          {account ? (
            <Navbar.Text className="d-flex align-items-center">
              {account.slice(0, 5) + "..." + account.slice(38, 42)}
              <Blockies
                seed={account}
                size={10}
                scale={3}
                color="#2187D0"
                bgColor="#F1F2F9"
                spotColor="#767F92"
                className="identicon mx-2"
              />
            </Navbar.Text>
          ) : (
            <Button onClick={connectHandler} disabled={loading} variant="primary">
              {loading ? "Connecting..." : "Connect Wallet"}
            </Button>
          )}
        </div>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Navigation;
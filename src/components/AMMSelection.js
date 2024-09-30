import React, { useState } from 'react';
import { Card, Form, Row, Col } from 'react-bootstrap';
import config from '../config.json';
import { useWeb3React } from '@web3-react/core';

const AMMSelection = ({ onSelectAMM }) => {
  const { chainId } = useWeb3React();
  const networkId = String(chainId) in config ? String(chainId) : '31337';
  const amms = config[networkId];

  const [selectedAmm1, setSelectedAmm1] = useState('amm1');
  const [selectedAmm2, setSelectedAmm2] = useState('amm2');

  const handleSelectAMM = (key, selectedAmmKey) => {
    if (!(selectedAmmKey in amms)) {
      console.error("Selected AMM configuration is missing in the config file.");
      return;
    }
    const ammAddress = amms[selectedAmmKey].ammAddress;
    if (key === 'amm1') {
      setSelectedAmm1(selectedAmmKey);
    } else {
      setSelectedAmm2(selectedAmmKey);
    }
    onSelectAMM(selectedAmmKey.toUpperCase(), ammAddress);
  };

  return (
    <Card>
      <Card.Body>
        <Form>
          <Row>
            <Col sm={6}>
              <Form.Label>AMM Selection:</Form.Label>
              <Form.Control
                as="select"
                value={selectedAmm1}
                onChange={(e) => handleSelectAMM('amm1', e.target.value)}
              >
                <option value="amm1">AMM1</option>
                <option value="amm2">AMM2</option>
              </Form.Control>
            </Col>
            <Col sm={6}>
              <Form.Label>AMM Selection:</Form.Label>
              <Form.Control
                as="select"
                value={selectedAmm2}
                onChange={(e) => handleSelectAMM('amm2', e.target.value)}
              >
                <option value="amm1">AMM1</option>
                <option value="amm2">AMM2</option>
              </Form.Control>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default AMMSelection;

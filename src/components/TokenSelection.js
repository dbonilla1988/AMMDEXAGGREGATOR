import React from 'react';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';

const TokenSelection = ({ onSelectToken }) => {
    return (
        <div>
            <h1>Token Selection</h1>
            <DropdownButton
                variant="outline-secondary"
                title="Select Token"
                onSelect={(eventKey) => onSelectToken(eventKey)}
            >
                <Dropdown.Item eventKey="DAPP">DAPP</Dropdown.Item>
                <Dropdown.Item eventKey="USD">USD</Dropdown.Item>
            </DropdownButton>
        </div>
    );
};

export default TokenSelection;

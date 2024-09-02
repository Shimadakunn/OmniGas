export $(cat .env | xargs) && forge verify-contract \
    --etherscan-api-key $ARBITRUMSCAN_API_KEY \
    0x877f7697224C828c7256b6c0ed8F1a8F4848a1AA src/Paymaster.sol:Paymaster \
    --chain 421614 \
    --constructor-args $(cast abi-encode "constructor(address,address,address)" 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789 0x1f29312f134C79984bA4b21840f2C3DcF57b9c85 0x6EDCE65403992e310A62460808c4b910D972f10f) \
    --watch

export $(cat .env | xargs) && forge verify-contract \
    --etherscan-api-key $ARBITRUMSCAN_API_KEY \
    0x10Fa4C0fe7a48B7d5372Cb84651AA90E5BEB8E88 src/SimplePaymaster.sol:SimplePaymaster \
    --chain 421614 \
    --watch
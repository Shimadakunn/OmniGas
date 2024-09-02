export $(cat .env | xargs) && forge verify-contract \
    0x2Ea26d50961dA6E45193f30f0D57AA582c2b77fF SimplePaymaster \
    --chain 421614 \
    --etherscan-api-key $ARBITRUMSCAN_API_KEY \
    --constructor-args $(cast abi-encode "constructor(address,address,address)" 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789 0x1f29312f134C79984bA4b21840f2C3DcF57b9c85 0x6EDCE65403992e310A62460808c4b910D972f10f) \
    --watch 
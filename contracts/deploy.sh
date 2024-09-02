export $(cat .env | xargs) && forge script DeployPaymaster \
    --private-key $PRIVATE_KEY --rpc-url $ARBITRUM_SEPOLIA_RPC_URL \
    --etherscan-api-key $ARBITRUMSCAN_API_KEY \
    --verify --slow --broadcast --via-ir

# export $(cat .env | xargs) && forge script DeployPaymaster \
#     --private-key $PRIVATE_KEY --rpc-url $OPTIMISM_SEPOLIA_RPC_URL \
#     --etherscan-api-key $OPTIMISMSCAN_API_KEY \
#     --verify --slow --broadcast --via-ir
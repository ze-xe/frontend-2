const axios = require('axios');
const fs = require('fs');

const CONFIG = (file, env, network) => `https://raw.githubusercontent.com/ze-xe/contracts/${env}/deployments/${network}/${file}.json`;

async function main() {
    const deployments = await axios.get(CONFIG('deployments', process.env.NODE_ENV, process.env.NETWORK));
    const config = await axios.get(CONFIG('config', process.env.NODE_ENV, process.env.NETWORK));
    // write to ./deployments.json
    fs.writeFileSync(process.cwd() + '/src/deployments/deployments.json', JSON.stringify(deployments.data, null, 2));
    fs.writeFileSync(process.cwd() + '/src/deployments/config.json', JSON.stringify(config.data, null, 2));
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
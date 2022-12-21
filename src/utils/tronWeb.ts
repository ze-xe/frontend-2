const TronWeb = require('tronweb');
const HttpProvider = TronWeb.providers.HttpProvider;
const node = 'https://nile.trongrid.io';
const fullNode = new HttpProvider(node);
const solidityNode = new HttpProvider(node);
const eventServer = new HttpProvider(node);
const privateKey = '52641f54dc5e1951657523c8e7a1c44ac76229a4b14db076dce6a6ce9ae9293d';
const tronWebObject = new TronWeb(
	fullNode,
	solidityNode,
	eventServer,
	privateKey
);

export default tronWebObject;
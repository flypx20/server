const crypto = require('crypto');

let fn = (str)=>{
	const hmac = crypto.createHmac('sha256', 'fzf1233');
	hmac.update(str);
	return hmac.digest('hex');
};
module.exports = fn;

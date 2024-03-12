var express = require('express');

const xrpl = require("xrpl");
const { Xumm } = require('xumm')

// $ npm install node-fetch@2.6.6 が必要
const fetch = require("node-fetch");

var router = express.Router();

const OWNER_ADDR = "rn3pWURH2KqqkijpyphuFRdLZMmw9ppeEb";
// TEST Addr: rNwWqQKsVuFqFgPpFpnkdBfjCFiTdaNBjM

//const OWNER_SEED = "sEdSJqJJLepXrdm4SxYwSpHfVA1Euuv";

const API_KEY = "7a39f924-075b-4e32-aaac-e73c260facb9"
const SECRET_KEY = "77a491b9-9359-4637-89b6-7b60dbe22b26"

const PAPI_KEY = "9bc728b30d0365aa4ca3"
const PSECRET_KEY = "bf3d57146662bb276f3ec0f81a0ea666d471be9a02a867a69239c0539acc9449"

const gatewayUrl = "https://gateway.pinata.cloud/ipfs/";
const pinataGatewayUrl = "https://orange-official-gecko-137.mypinata.cloud/ipfs/"

const bithompUrl = "https://test.bithomp.com/ja/nft/";
const bithompAllUrl = "https://test.bithomp.com/ja/nft-explorer?issuer=rn3pWURH2KqqkijpyphuFRdLZMmw9ppeEb";


const DEF_TAXON_NO = 2;
const NFT_COLLECTION = [DEF_TAXON_NO, 3, 1];
let currentNftNo = 0;

let allTokens = null;

class NftInfo {

  nftid;
  nfttaxon;
  transferfee;
  owner;
  name;
  description;
  imageUrl;
  attributes;
  selloffer_id;
  selloffer_amount;
  buyoffers;

  constructor(nftid, nfttaxon, transferfee) {
    this.nftid = nftid;
    this.nfttaxon = nfttaxon;
    this.transferfee = transferfee;
  }
  setName(name) {
    this.name = name;
  }
  setDescription(description) {
    this.description = description;
  }
  setImageUrl(imageUrl) {
    this.imageUrl = imageUrl;
  }
  setAttributes(attributes) {
    this.attributes = attributes;
  }
  setSelloffer_id(selloffer_id) {
    this.selloffer_id = selloffer_id;
  }
  setSelloffer_amount(selloffer_amount) {
    this.selloffer_amount = selloffer_amount;
  }
  setBuyoffers(buyoffers) {
    this.buyoffers = buyoffers;
  }
}

function getNet() {
  let net = "wss://s.altnet.rippletest.net:51233";
  return net;
} // End of getNet()

async function geClient() {
  let net = getNet();
  client = new xrpl.Client(net, {
    connectionTimeout: 10000
  });
//  client = new xrpl.Client(net);
  console.log("Connecting....");
  await client.connect();

  console.log("Connected");
  return client;
}

async function getTokens(client, addr) {

  nfts = await client.request({
    method: "account_nfts",
    account: addr,
//    limit: 20
  });

  return nfts;
} //End of getTokens()


async function getSellOffers(client, nftID) {
  
  const response = await client.request({
    command: "nft_sell_offers",
    nft_id: nftID,
    ledger_index: "validated"
  })

  return response;
} //End of getSellOffers()

async function getBuyOffers(client, nftID) {
  
  const response = await client.request({
    command: "nft_buy_offers",
    nft_id: nftID,
    ledger_index: "validated"
  })

  return response;
} //End of getBuyOffers()



async function getAccountTokens(client, addr) {
  tokens = await getTokens(client, addr);
//  id = tokens.id;
//  account = tokens.result.account;
  account_nfts = tokens.result.account_nfts;
  console.table(account_nfts);

//  results = JSON.stringify(tokens, null, 2);
//  console.log(results);
//  console.table(tokens);

  return account_nfts;
}

var ids = new Map([
  //Glass
  ["QmU4VsTJcKt4eSzCrL9t5hu1HAnsTXkNJkHvNzFGBxpaWR","QmU4VsTJcKt4eSzCrL9t5hu1HAnsTXkNJkHvNzFGBxpaWR"],
  ["QmYitbRKVj2g8M8xU7x1x5nRo6czMRbrWZHZkngT3hxdHn","QmYitbRKVj2g8M8xU7x1x5nRo6czMRbrWZHZkngT3hxdHn"],
  ["QmcD8jxXXsbgYuRkmohQ6AX8xy85iLjERvy5eM2pr7aGR4","QmcD8jxXXsbgYuRkmohQ6AX8xy85iLjERvy5eM2pr7aGR4"],
  ["QmXqpAo5y9hRMzeRF58rgbT9Hyvu8pvMFeS99ujc4mzJw5","QmXqpAo5y9hRMzeRF58rgbT9Hyvu8pvMFeS99ujc4mzJw5"],
  ["QmSXSMfWaxkqDRvhG9UVqvSL8A75SAMfYeqH8wkbPQeRbF","QmSXSMfWaxkqDRvhG9UVqvSL8A75SAMfYeqH8wkbPQeRbF"],
  ["QmXR8h97Fp9a6QcxWCBE4zTMo5hh2KXDefxazW3CGszDXQ","QmXR8h97Fp9a6QcxWCBE4zTMo5hh2KXDefxazW3CGszDXQ"],
  ["Qmd6LaQH6jwRWZwEYpdfPrv5d8UV1CQjmvdPLyKHqkeiEP","Qmd6LaQH6jwRWZwEYpdfPrv5d8UV1CQjmvdPLyKHqkeiEP"],
  ["QmRpu7AP1PFCySyvhm3gSJZxvHjTve5scHavB5r5itpDwX","QmRpu7AP1PFCySyvhm3gSJZxvHjTve5scHavB5r5itpDwX"],

//  ["QmSXSMfWaxkqDRvhG9UVqvSL8A75SAMfYeqH8wkbPQeRbF","QmYqYT5efAktkcSLz38sE3QLQYK5SnuByYWADFHoKNVBAm/004.json"],
//  ["QmXR8h97Fp9a6QcxWCBE4zTMo5hh2KXDefxazW3CGszDXQ","QmYqYT5efAktkcSLz38sE3QLQYK5SnuByYWADFHoKNVBAm/006.json"],
//  ["Qmd6LaQH6jwRWZwEYpdfPrv5d8UV1CQjmvdPLyKHqkeiEP","QmYqYT5efAktkcSLz38sE3QLQYK5SnuByYWADFHoKNVBAm/007.json"],
//  ["QmRpu7AP1PFCySyvhm3gSJZxvHjTve5scHavB5r5itpDwX","QmYqYT5efAktkcSLz38sE3QLQYK5SnuByYWADFHoKNVBAm/008.json"],
  ["QmTsHR7BR8SbLviWG3CyfJh4t4i94ypLmQXj1zzABZZArM","QmYqYT5efAktkcSLz38sE3QLQYK5SnuByYWADFHoKNVBAm/009.json"],
  ["QmQcSjpgVPgCzdicygycNY6hABGCx3D6T5qaitZ8buEcFa","QmYqYT5efAktkcSLz38sE3QLQYK5SnuByYWADFHoKNVBAm/010.json"],
  ["QmSYHoP1yWjjpJMGTjVejaUueFskcwD1hkDPtYAGzMiagH","QmYqYT5efAktkcSLz38sE3QLQYK5SnuByYWADFHoKNVBAm/011.json"],
  ["QmWJDaDkjjtW23TL7Yut9z9PqsSdwusxCwQHNmXKE7YKfQ","QmYqYT5efAktkcSLz38sE3QLQYK5SnuByYWADFHoKNVBAm/012.json"],
  ["QmZXwvswezowb9gx4QvfjpCzYWabVX9PYTSPoqtU6dAQ7z","QmYqYT5efAktkcSLz38sE3QLQYK5SnuByYWADFHoKNVBAm/013.json"],
  ["QmP3bXB8Z67jkZ9kogWjpmWmYR4Q93H4bH9UEodpb9Cvmy","QmYqYT5efAktkcSLz38sE3QLQYK5SnuByYWADFHoKNVBAm/014.json"],
  ["QmRrY7T8iUd2uDpiDxS73L2LqohSya6tn9Ym99wpm8nerq","QmYqYT5efAktkcSLz38sE3QLQYK5SnuByYWADFHoKNVBAm/015.json"],
  ["QmQurzgRHUztPb6QeJe83noLbfzsuDxKPyBBGx3c6RP1Zp","QmYqYT5efAktkcSLz38sE3QLQYK5SnuByYWADFHoKNVBAm/016.json"],
  ["QmWsCtn2Yb9rL5GGAyTExruaCbpQrPkWToWmvck53xvTt4","QmYqYT5efAktkcSLz38sE3QLQYK5SnuByYWADFHoKNVBAm/017.json"],
  ["QmebxjmDuVtZwC5HjTHiaAhPunijCz6ZKtU4Dt6bBs9YZS","QmYqYT5efAktkcSLz38sE3QLQYK5SnuByYWADFHoKNVBAm/018.json"],
  ["QmZaCCT2Bhvdscat66y3L4tYho5odJprPtDKRYeaR2VkcK","QmYqYT5efAktkcSLz38sE3QLQYK5SnuByYWADFHoKNVBAm/019.json"],
  ["QmWxizWhVPoWtDdG4Qc4UkZaALdks8U99jNNQPFLQRH3nq","QmYqYT5efAktkcSLz38sE3QLQYK5SnuByYWADFHoKNVBAm/020.json"],

  //AX Coins
  ["QmT2qx7uJfP5oQDbBJNNf96WX7npWvtED5bXfy7TfrdHtR","QmRtZhLrzaEnZFdBsPM5gLfocHWzRxYFaSTnYRkmF53VtG/axc001.json"],
  ["QmUHtyE6KTXcujopwXiNcj91LQR2vdaGvcphCaupxdo5ja","QmRtZhLrzaEnZFdBsPM5gLfocHWzRxYFaSTnYRkmF53VtG/axc002.json"],
  ["QmYs1vuqWCMWbcinHR2CnQEWAUJGaTryJ8chX4yKQRBjFc","QmRtZhLrzaEnZFdBsPM5gLfocHWzRxYFaSTnYRkmF53VtG/axc003.json"],
  ["QmVVfF9WMWVuhbbmB1dugxBLx1n62m3VgiuTcDq6PCmNEv","QmRtZhLrzaEnZFdBsPM5gLfocHWzRxYFaSTnYRkmF53VtG/axc005.json"],
  ["QmUCA333v27rx9DieUhD8KydMPbQVyfQgu2cKcajH5kFTN","QmRtZhLrzaEnZFdBsPM5gLfocHWzRxYFaSTnYRkmF53VtG/axc008.json"],
  ["QmWoA6Mx45wCBHs5ohFLEdjWiAgMZAJV2evpErBgHpxXBe","QmRtZhLrzaEnZFdBsPM5gLfocHWzRxYFaSTnYRkmF53VtG/axc009.json"],
  ["QmNakmvsJLAJxBr9r7DUiwEAQcCo7igqb2odWjEBi2Mr16","QmRtZhLrzaEnZFdBsPM5gLfocHWzRxYFaSTnYRkmF53VtG/axc010.json"],
  ["QmUQ2AA3z2Rg5gq6j4pnJFQagyuQkmChVo1qajHZSGwUB9","QmRtZhLrzaEnZFdBsPM5gLfocHWzRxYFaSTnYRkmF53VtG/axc011.json"],
  ["QmXx6pyGY64ejkxvdCa8GhbCnsAs4ULFjpona2y8zQpFgD","QmRtZhLrzaEnZFdBsPM5gLfocHWzRxYFaSTnYRkmF53VtG/axc012.json"],
  ["QmTpDjMTsBcR5gEifuenaXvburAj48axC6gxGWzwLepSAo","QmRtZhLrzaEnZFdBsPM5gLfocHWzRxYFaSTnYRkmF53VtG/axc013.json"],
  ["Qmag5HpudUzgL9hrHFyHtAsGGrJSnhzjBJjzAaPckfNXwM","QmRtZhLrzaEnZFdBsPM5gLfocHWzRxYFaSTnYRkmF53VtG/axc014.json"],
  ["QmXHwPBDDioZxv9rPug56hH6g2WzWPw7p2L65jqDs5WHUa","QmRtZhLrzaEnZFdBsPM5gLfocHWzRxYFaSTnYRkmF53VtG/axc015.json"],
  ["QmVDu5bj8ex6ZmjnCCXNLp93FAdk8xfJ216X3oSfTkFCAo","QmRtZhLrzaEnZFdBsPM5gLfocHWzRxYFaSTnYRkmF53VtG/axc017.json"],
  ["QmeHF3HuLKm6vbxf3P5oG1KQytjMvyNX52QMK1w5puFtcy","QmRtZhLrzaEnZFdBsPM5gLfocHWzRxYFaSTnYRkmF53VtG/axc018.json"],


  //Image
  ["QmdhVfQb9V8tkqNYhfvqhPGgJQ1szJqwurCq6FsgPaw3f8","QmdhVfQb9V8tkqNYhfvqhPGgJQ1szJqwurCq6FsgPaw3f8"],
  ["QmQSfgymDmojeG1WgXHtG4zFzEVnCoYZrShwVbSXNxo4Aq","QmQSfgymDmojeG1WgXHtG4zFzEVnCoYZrShwVbSXNxo4Aq"],
  ["QmVJKAMvhbNaFgArwjkfnzbdwYMfS3gnBsiGEgHTqxy7Fa","QmVJKAMvhbNaFgArwjkfnzbdwYMfS3gnBsiGEgHTqxy7Fa"],
  ["QmbRZ3maNRKZ4NCTTMZ6oYQm8SNHoo8ZD8ssU75dm2nXF1","QmbKAL2cqutDHvNXoM5Hh8DaheJAWkinB8vRDX9kcZhqh7/002.png"],
//  ["QmVJKAMvhbNaFgArwjkfnzbdwYMfS3gnBsiGEgHTqxy7Fa","QmbKAL2cqutDHvNXoM5Hh8DaheJAWkinB8vRDX9kcZhqh7/003.png"],
  ["QmR1v16UxihDx6BEMYvc1o14cfzu3cnsvkQppot7ptEhwT","QmbKAL2cqutDHvNXoM5Hh8DaheJAWkinB8vRDX9kcZhqh7/006.png"],
  ["QmQqhhd7WCE84xxtak5rorfYtp6SWf4UwuEJArAEHqu1bK","QmbKAL2cqutDHvNXoM5Hh8DaheJAWkinB8vRDX9kcZhqh7/007.png"],
  ["QmWNxx3NKqoEjeUJw6ShmWraxMwYGqLP4bFLfSHVmmBodb","QmbKAL2cqutDHvNXoM5Hh8DaheJAWkinB8vRDX9kcZhqh7/008.png"],
  ["QmWeU6rVjGitYEgm8dnH8GsTCbxANxRsZT9RENeEyeubr9","QmbKAL2cqutDHvNXoM5Hh8DaheJAWkinB8vRDX9kcZhqh7/009.png"],
  ["QmZYof12JTvFKYVtSsWraESyx56YjWyPNRTr8xAbSP3nAA","QmbKAL2cqutDHvNXoM5Hh8DaheJAWkinB8vRDX9kcZhqh7/010.png"],
  ["QmZuuqxtvQVTDLv1p5J14gwbu3jJyWyvtLn6wpbRkuKUph","QmbKAL2cqutDHvNXoM5Hh8DaheJAWkinB8vRDX9kcZhqh7/011.png"],
  ["Qmd2eb7f4fAoe4PXwvnDpUXagMfGqSzA383hyzMCnPAHeq","QmbKAL2cqutDHvNXoM5Hh8DaheJAWkinB8vRDX9kcZhqh7/012.png"],
  ["QmSYCKZ62VLtLLkZwmycBdgGBrYwa12oREXmX7ykC9nGNh","QmbKAL2cqutDHvNXoM5Hh8DaheJAWkinB8vRDX9kcZhqh7/013.png"],
  ["QmcyvPVa4MEpNs4P3C71uu2TpRoHnJX8nZpjHsvSae5iRG","QmbKAL2cqutDHvNXoM5Hh8DaheJAWkinB8vRDX9kcZhqh7/014.png"],
  ["QmdnaJZi1GLTe2i79fDrY7rVRitKMeRa31dbNnHXkb9bex","QmbKAL2cqutDHvNXoM5Hh8DaheJAWkinB8vRDX9kcZhqh7/015.png"],
  ["QmZdPPPo3zYJ5WAsbt8ApkrxXUUeahJJNBrmSiWNc7PwFb","QmbKAL2cqutDHvNXoM5Hh8DaheJAWkinB8vRDX9kcZhqh7/016.png"],
  ["QmPovMbqqH6jqonHfqbY36qpQHuoY6m1uaNDrYVZDGi9Qj","QmbKAL2cqutDHvNXoM5Hh8DaheJAWkinB8vRDX9kcZhqh7/017.png"],
  ["QmdLD2rTGprRisem8UMKZvwC8jWGfCoX9UZUiNTvCvwg1N","QmbKAL2cqutDHvNXoM5Hh8DaheJAWkinB8vRDX9kcZhqh7/018.png"],
  ["QmdRSny8QnXmT9D1pHQ2VHYbC3VoUz6PsRdxhnW38wEk5z","QmbKAL2cqutDHvNXoM5Hh8DaheJAWkinB8vRDX9kcZhqh7/019.png"],
  ["QmU71wp165B9j7EDUALQc92m7jFY3or5y9f8inVtasAokR","QmbKAL2cqutDHvNXoM5Hh8DaheJAWkinB8vRDX9kcZhqh7/020.png"],

  ["QmRr9EhTPs1VawRQvUGYvqcDF49qzWqf6UgaoMk9To3FFX","QmVkp8BakK7225k6WBdHfDk72xVuPdw8pwytHBETjoTwUE/axc001.png"],
  ["QmcQDCU9xZbCTGmDYUkxjtiuUD1jV1HjTZDbLvxcVjPmcy","QmVkp8BakK7225k6WBdHfDk72xVuPdw8pwytHBETjoTwUE/axc002.png"],
  ["QmTQEuPpPUjaqmnrp9kd4mKFngyTk3VxGrqnkBzi4B47Ap","QmVkp8BakK7225k6WBdHfDk72xVuPdw8pwytHBETjoTwUE/axc003.png"],
  ["QmWYUyuhenNwq6u7xfDtHHPcKp8MYxioCaniWnLjejHNhC","QmVkp8BakK7225k6WBdHfDk72xVuPdw8pwytHBETjoTwUE/axc005.png"],
  ["QmX1FT525B14PBkHoodAhq6wNc62umtT3pNHjgNQFWgSDm","QmVkp8BakK7225k6WBdHfDk72xVuPdw8pwytHBETjoTwUE/axc008.png"],
  ["Qma8EoJoL2rykWnRxRKPbw15Z6gaZLpb9HYonk9cgDMNoZ","QmVkp8BakK7225k6WBdHfDk72xVuPdw8pwytHBETjoTwUE/axc009.png"],
  ["Qmca8SUnbDCcWGH3PeqTLt8DXLMjqWtk9LWKc3sxcsNeyA","QmVkp8BakK7225k6WBdHfDk72xVuPdw8pwytHBETjoTwUE/axc010.png"],
  ["QmSCc73aDZqwAJKebiWyCBzyVf5A8e2Pa2jMfb86rS8krK","QmVkp8BakK7225k6WBdHfDk72xVuPdw8pwytHBETjoTwUE/axc011.png"],
  ["QmYNERRwcbkoWVGjGFA9X4UfrfrAhb224366LfzntB5gJr","QmVkp8BakK7225k6WBdHfDk72xVuPdw8pwytHBETjoTwUE/axc012.png"],
  ["QmYL39ooxcRCipuMbPBpeXaNypujdS4ZPp8rAWACJ2axyN","QmVkp8BakK7225k6WBdHfDk72xVuPdw8pwytHBETjoTwUE/axc013.png"],
  ["QmT17cmGG3cSgUqtkZn7ajg9vKfHgbbLsKQdvDkUCSixee","QmVkp8BakK7225k6WBdHfDk72xVuPdw8pwytHBETjoTwUE/axc014.png"],
  ["QmUiQodTtR2FUTug4NyHoJWuHAxmivrQTGhi3bboEcxspW","QmVkp8BakK7225k6WBdHfDk72xVuPdw8pwytHBETjoTwUE/axc015.png"],
  ["QmeCkWCozCYDNQiWZzinU5dDYhHYcCGkEYpwhK4sctUxwV","QmVkp8BakK7225k6WBdHfDk72xVuPdw8pwytHBETjoTwUE/axc017.png"],
  ["QmX9UqbJtHZ1ahr2op7bkNGqrswfcA4F8dXQPGW7ZkT3y7","QmVkp8BakK7225k6WBdHfDk72xVuPdw8pwytHBETjoTwUE/axc018.png"],
  ["test", "value"]
]);



function getContentUrl(uri) {

  let idbody = uri.split('://').pop();
  let contentUrl;
  if (ids.has(idbody)) {
    contentUrl = pinataGatewayUrl + ids.get(idbody);
//    console.log("uri:" + uri);
//    console.log("idbody:" + idbody);
  }else{
    contentUrl = pinataGatewayUrl + idbody;
  }
//    console.log("contentUrl:" + contentUrl);
//  contentUrl = null;

  return contentUrl;
}

async function getNFTInfo(client, input_nfts) {

  let nfts = [];

  for (const nft of input_nfts) {

    tokenid = nft.NFTokenID;
    taxon = nft.NFTokenTaxon;
    fee = nft.TransferFee;
    nftinfo = new NftInfo(tokenid, taxon, fee);

    uri = xrpl.convertHexToString(nft.URI);
    let contentUrl = getContentUrl(uri);

    let json = undefined;
    if(contentUrl != null){
      //Error: Rate Limit
      const response = await fetch(contentUrl);
      json = await response.text();
    }

    if(json != undefined){
//      let body;
      try {
        let body = JSON.parse(json);

  //    console.log("==============")
  //    console.log(tokenid);
  //    console.log(body);

        nftinfo.setName(body.name);
        nftinfo.setDescription(body.description);

//        let imageurl = body.image.split('://').pop();
//        path = gatewayUrl + imageurl;
        
        let path = getContentUrl(body.image);
//        console.log("image path:" + path);

        nftinfo.setImageUrl(path);
        nftinfo.setAttributes(body.attributes);

      } catch (error) {
  //      console.log(json);
        console.log(error);
      }
    }

    try {
      o_responcejson = await getSellOffers(client, tokenid);
      if(o_responcejson.result != undefined){
    
        offers = o_responcejson.result.offers;
//        console.table(offers);
        for (const offer of offers) {
          let xrp = xrpl.dropsToXrp(offer.amount);
          nftinfo.setSelloffer_id(offer.nft_offer_index);
          nftinfo.setSelloffer_amount(xrp);
        }
      }else{
        nftinfo.setSelloffer_amount("-");
      }
    } catch (error) {
      console.log("No Offers!");
      console.log(error);
    }

//    await getBuyOffers(client, tokenid);

    nfts.push(nftinfo);
  }


  return nfts;
}


router.get('/', async function(req, res, next) {

  console.log("GET");
  console.log(req.query);

  let isIssuer = true;
  let addr = OWNER_ADDR;

  const client = await geClient();

  let nfts;

  // User Account Mode
  if(req.query.accountField != undefined && req.query.accountField != ""){
    console.log("SET:"+req.query.accountField);
    addr = req.query.accountField;
    isIssuer = false;

    allTokens = await getAccountTokens(client, addr);
    nfts = await getNFTInfo(client, allTokens);
  
  }else{
    allTokens = await getAccountTokens(client, addr);
    let nfts_g1 = allTokens.filter( nft => nft.NFTokenTaxon == DEF_TAXON_NO );
    console.log("========= nfts_g1 =========================");
    console.table(nfts_g1);
    nfts = await getNFTInfo(client, nfts_g1);  
  }


  client.disconnect();
  res.render('index', { nfts: nfts, isIssuer:isIssuer, nftsall:[] });

//  let nfts = [];
//  res.render('index', { nfts: nfts, isIssuer:true });
});


router.post('/', async function (req, res) {

//  console.log("post post");
//  console.log(req.body.addr);

  res.redirect('/');
})

router.post('/loadmore', async function (req, res) {
//  console.log("========= allTokens =========================");
//  console.table(allTokens);
  
  currentNftNo = currentNftNo + 1;

  if(currentNftNo >= NFT_COLLECTION.length){
    let nfts = [];
    res.send(nfts);
    return;
  }

//  let nfts_except = allTokens.filter( nft => nft.NFTokenTaxon != DEF_TAXON_NO );

  let nfttaxon = NFT_COLLECTION[currentNftNo]
  let nfts_except = allTokens.filter( nft => nft.NFTokenTaxon == nfttaxon);

  console.log("========= nfts_except =========================");
  console.table(nfts_except);

  client = await geClient();
  let nfts = await getNFTInfo(client, nfts_except);

  client.disconnect();
  res.send(nfts);
})

router.post('/req-xumm', async function (req, res) {
//  console.log(req.body)

//  res.header("Access-Control-Allow-Origin", "*");
//  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//  res.end();

  const xumm = new Xumm(API_KEY, SECRET_KEY);
  console.log(req.body.id);
  id = req.body.id;

  xumm.payload?.create({
    TransactionType : "NFTokenAcceptOffer",
    NFTokenSellOffer: id
//    NFTokenBuyOffer: id
  }).then((payload)=>{
//    console.log(payload.next.always)

    const jsonObject = {
      xummlink: payload.next.always
    };
    const json = JSON.stringify(jsonObject);

    res.send(json);

  });
})


module.exports = router;

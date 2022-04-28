import * as dns from "dns";

async function main() {
  console.log("main");
  console.log(dns.getServers());
}

main();

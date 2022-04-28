import * as dgram from "dgram";
import debug from "debug";
const packet = require("native-dns-packet");

const loginfo = debug("didapp:dns:info");
// const logdebug = debug("didapp:dns:debug");
// const logquery = debug("didapp:dns:query");
const logerror = debug("didapp:dns:error");

type IResolutionRequest = string;
type IResolutionResponse = string;
export interface IDnsResolver {
  (resolutionRequest: IResolutionRequest): IResolutionResponse;
}
export function DnsResolver(): IDnsResolver {
  const resolver: IDnsResolver = (_request) => {
    return "127.0.0.1";
  };
  return resolver;
}

export interface IDnsServerListenController {
  address: string;
  stop(): Promise<void>;
}
export interface IDnsServer {
  listen(): IDnsServerListenController;
}

interface IListenInfo {
  address: string;
}

export async function withServerListening(
  server: DnsServer,
  port: number | undefined,
  host: string,
  onceListening: (info: IListenInfo) => void | Promise<void>
) {
  const { stop: stopListening, address } = await server.listen(port, host);
  await onceListening({ address });
  await stopListening();
}

const DnsRecordTypeEnum = {
  1: "A",
  2: "NS",
  5: "CNAME",
  6: "SOA",
  12: "PTR",
  15: "MX",
  16: "TXT",
  28: "AAAA",
};

interface IDnsQuery {
  question: Array<{
    name: string;
    type: number;
    class: number;
    ttl: number;
    address: string;
  }>;
}
export class DnsServer {
  createAnswer(query: IDnsQuery): Buffer {
    const answer = {
      ...query,
      answer: [
        {
          name: query.question[0].name,
          type: 1,
          class: 1,
          ttl: 30,
          address: "127.0.0.1",
        },
      ],
    };
    const buf = Buffer.alloc(4096);
    const wrt = packet.write(buf, answer);
    const res = buf.slice(0, wrt);
    return res;
  }
  listen(
    port: number | undefined,
    host: string
  ): Promise<IDnsServerListenController> {
    const socket = dgram.createSocket("udp4");
    socket.on("error", function (err) {
      logerror("udp socket error");
      logerror(err);
    });
    socket.on("message", (message, rinfo) => {
      const query = packet.parse(message);
      const domain = query.question[0].name;
      const type = query.question[0].type;
      loginfo("socket got message", { domain, type });
      const res = this.createAnswer(query);
      socket.send(res, 0, res.length, rinfo.port, rinfo.address);
    });
    socket.bind(port, host);
    const stop = async () => {
      socket.close();
    };
    return new Promise((resolve, _reject) => {
      socket.on("listening", function () {
        loginfo("we are up and listening at %s on %s", socket.address());
        const addressInfo = socket.address();
        const address = `${addressInfo.address}:${addressInfo.port}`;
        resolve({ address, stop });
      });
    });
  }
}

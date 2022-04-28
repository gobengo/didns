/// <reference types="node" />
declare type IResolutionRequest = string;
declare type IResolutionResponse = string;
export interface IDnsResolver {
    (resolutionRequest: IResolutionRequest): IResolutionResponse;
}
export declare function DnsResolver(): IDnsResolver;
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
export declare function withServerListening(server: DnsServer, port: number | undefined, host: string, onceListening: (info: IListenInfo) => void | Promise<void>): Promise<void>;
interface IDnsQuery {
    question: Array<{
        name: string;
        type: number;
        class: number;
        ttl: number;
        address: string;
    }>;
}
export declare class DnsServer {
    createAnswer(query: IDnsQuery): Buffer;
    listen(port: number | undefined, host: string): Promise<IDnsServerListenController>;
}
export {};

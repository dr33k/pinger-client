import { Status } from "../enums/status.enum";

export interface Server{
    id: number;
    ipAddress: string;
    name: string;
    type: string;
    imageUrl: string;
    memory: string;
    status: Status;
}

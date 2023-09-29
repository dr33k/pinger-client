import { DataState } from "../enums/data.state.enum";
import { Server } from "./server";

export interface AppState<T>{
    dataState: DataState;
    appData?: T;
    error?: string;
    servers?: Server[];
}
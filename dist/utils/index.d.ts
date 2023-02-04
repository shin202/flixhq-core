import { AnyNode, Cheerio, CheerioAPI } from "cheerio";
import { IMovieInfo, IMovieResult } from "../types/types";
export declare const setMovieData: ($: Cheerio<AnyNode>, baseUrl: string) => IMovieResult;
export declare const isJson: (data: string) => boolean;
export declare const setMovieInfo: ($: CheerioAPI, movieInfo: IMovieInfo, baseUrl: string) => void;
//# sourceMappingURL=index.d.ts.map
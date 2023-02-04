import { IVideoResult } from "../types/types";
declare class MixDrop {
    protected serverName: string;
    extract: (videoUrl: URL) => Promise<IVideoResult>;
    private formatter;
}
export default MixDrop;
//# sourceMappingURL=mixdrop.d.ts.map
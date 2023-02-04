import { IVideoResult } from '../types/types';
declare class VidCloud {
    protected serverName: string;
    private readonly host;
    private readonly host2;
    extract: (videoUrl: URL, isAlternative?: boolean) => Promise<IVideoResult>;
}
export default VidCloud;
//# sourceMappingURL=vidcloud.d.ts.map
import { FFProbeStream } from "ffprobe";

declare type CodecType = NonNullable<FFProbeStream["codec_type"]>;

declare interface VideoAsset {
  /**
   * The path to emitted video file
   */
  path: string;
  streams: FFProbeStream[];
  getStreamListByCodecType(codecType: CodecType): FFProbeStream[];
  getStreamByCodecType(codecType: CodecType): FFProbeStream | undefined;
  getDimensions(): { width: number; height: number };
}

declare module "*.mp4" {
  const videoAsset: VideoAsset;

  export default videoAsset;
}


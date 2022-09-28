const { interpolateName } = require("loader-utils");
const ffprobe = require("ffprobe");
const { path: ffprobePath } = require("ffprobe-static");
const path = require("path");

const exportStreamsKey = "[streams]",
  exportPathKey = "[path]",
  exportTemplate = `
class VideoAsset {
  constructor(streams, path){
    this.path=path;
    this.streams=streams
  }
  getStreamListByCodecType(codecType){
    return this.streams.filter(st => st.codec_type === codecType)
  }
  getStreamByCodecType(codecType){
    return this.getStreamListByCodecType(codecType)[0]
  }
  getDimensions(){
    const stream = this.getStreamByCodecType('video')

    return {
      width: stream.width,
      height: stream.height
    }
  }
}

export default (new VideoAsset(${exportStreamsKey}, \`\${${exportPathKey}}\`))`;

/**
 * @type {import('json-schema').JSONSchema4}
 */
const schema = {
  type: "object",
  properties: {
    name: {
      type: "string",
    },
    context: {
      type: "string",
    },
  },
};

/**
 * @type {(this: import('webpack').LoaderContext<{}>) => void}
 */
module.exports = function (source) {
  const callback = this.async();
  const options = this.getOptions(schema);

  const name = options.name || "[path][contenthash]-[name].[ext]";
  const context = options.context || this.rootContext;

  ffprobe(this.resourcePath, { path: ffprobePath }, (err, info) => {
    const outputPath = interpolateName(this, name, {
      content: source,
      context,
    }).replace("public/", "");

    const publicPath = `__webpack_public_path__ + '${outputPath}'`;

    this.emitFile(outputPath, source, undefined, {
      sourceFilename: path.posix.relative(this.rootContext, this.resourcePath),
    });

    callback(
      err,
      info &&
        exportTemplate
          .replace(exportStreamsKey, JSON.stringify(info.streams))
          .replace(exportPathKey, publicPath)
    );
  });
};


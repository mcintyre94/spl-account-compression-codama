import {
  Address,
  fixCodecSize,
  FixedSizeCodec,
  FixedSizeEncoder,
  fixEncoderSize,
  getAddressCodec,
  getAddressEncoder,
  getArrayCodec,
  getArrayEncoder,
  getStructCodec,
  getStructEncoder,
  getU32Codec,
  getU32Encoder,
} from "@solana/kit";

export type ChangeLog = {
  root: Address;
  pathNodes: Address[];
  index: number;
};

export type ChangeLogArgs = ChangeLog;

export function getChangeLogCodec(maxDepth: number): FixedSizeCodec<ChangeLog> {
  return getStructCodec([
    ["root", getAddressCodec()],
    ["pathNodes", getArrayCodec(getAddressCodec(), { size: maxDepth })],
    ["index", fixCodecSize(getU32Codec(), 8)],
  ]);
}

import { AssetMetadata, AssetDetails } from '@polkadot/types/interfaces';

export interface ChainAsset extends AssetDetails {
    id: string;
    metadata: AssetMetadata
}

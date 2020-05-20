interface Rating {
  Weiss: {
    Rating: string;
    TechnologyAdoptionRating: string;
    MarketPerformanceRating: string;
  };
}

interface Taxonomy {
  Access: string;
  FCA: string;
  FINMA: string;
  Industry: string;
  CollateralizedAsset: string;
  CollateralizedAssetType: string;
  CollateralType: string;
  CollateralInfo: string;
}

export interface Coin {
  Id: string;
  Url: string;
  ImageUrl: string;
  ContentCreatedOn: number;
  Name: string;
  Symbol: string;
  CoinName: string;
  FullName: string;
  Algorithm: string;
  ProofType: string;
  FullyPremined: string;
  TotalCoinSupply: string;
  BuiltOn: string;
  SmartContractAddress: string;
  DecimalPlaces: number;
  PreMinedValue: string;
  TotalCoinsFreeFloat: string;
  SortOrder: string;
  Sponsored: boolean;
  Taxonomy: Taxonomy;
  Rating: Rating;
  IsTrading: boolean;
  TotalCoinsMined: number;
  BlockNumber: number;
  NetHashesPerSecond: number;
  BlockReward: number;
  BlockTime: number;
}

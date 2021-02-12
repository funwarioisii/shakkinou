export type Splatoon2BattleLog = {
  time: number,
  id: number,
  result: boolean,
  weaponId: number,
  stageId: number,
  ruleId: number,
  memo: string
}

export interface Splatoon2BattleLoggerConnector {
  fetchBattleLogs: () => Promise<Splatoon2BattleLog[]>;
  createBattleLog: (log: Splatoon2BattleLog) => Promise<boolean>;
}

// これ筋悪
export interface Splatoon2BattleLogger {
  showBattleLogs: (logSize: number) => Promise<Splatoon2BattleLog[]>;
  createBattleLog: (log: Splatoon2BattleLog) => Promise<boolean>;
  // accumulate: () => Promise<Splatoon2BattleLog[]>; 良い実装を思いついたら書く。どういう集約結果が見たいだろう、勝てる武器？
}

const rules = [
  "ガチマッチ",
  "ガチアサリ",
  "ナワバリ",
  "ガチエリア"
];

const stages = [
  "バッテラストリート",
  "フジツボスポーツクラブ",
  "ガンガゼ野外音楽堂",
  "コンブトラック",
  "海女美術大学",
  "チョウザメ造船",
  "タチウオパーキング",
  "ホッケふ頭",
  "マンタマリア号",
  "モズク農園",
  "エンガワ河川敷",
  "Bバスパーク",
  "ザトウマーケット",
  "ハコフグ倉庫",
  "デボン海洋博物館",
  "アロワナモール",
  "アジフライスタジアム",
  "ショッツル鉱山",
  "モンガラキャンプ場",
  "スメーシーワールド",
  "ホテルニューオートロ",
  "アンチョビットゲームズ",
  "ムツゴ楼"
];

const weapons = [
  "スプラシューターコラボ",
  "52ガロン",
  "わかばシューター",
  "オクタシューターレプリカ",
  "96ガロンデコ",
  "シャープマーカー",
  "N_ZAP89",
  "N_ZAP85",
  "プライムシューター",
  "シャープマーカーネオ",
  "ボールドマーカー",
  "ボールドマーカーネオ",
  "プロモデラーRG",
  "スプラシューター",
  "_52ガロンデコ",
  "L3リールガンD",
  "ジェットスイーパーカスタム",
  "プライムシューターコラボ",
  "もみじシューター",
  "プロモデラーMG",
  "H3リールガンチェリー",
  "_96ガロン",
  "ボールドマーカー7",
  "N_ZAP83",
  "ヒーローシューターレプリカ",
  "L3リールガン",
  "ジェットスイーパー",
  "H3リールガン",
  "プロモデラーPG",
  "H3リールガンD",
  "ボトルガイザー",
  "ボトルガイザーフォイル",
  "スプラシューターベッチュー",
  "プライムシューターベッチュー",
  "おちばシューター",
  "L3リールガンベッチュー",
  "_52ガロンベッチュー",
  "デュアルスイーパー",
  "デュアルスイーパーカスタム",
  "スプラマニューバー",
  "スプラマニューバーコラボ",
  "スパッタリー",
  "ヒーローマニューバーレプリカ",
  "ケルビン525",
  "スパッタリー_ヒュー",
  "クアッドホッパーブラック",
  "ケルビン525デコ",
  "クアッドホッパーホワイト",
  "スプラマニューバーベッチュー",
  "ケルビン525ベッチュー",
  "スパッタリークリア",
  "スプラスコープ",
  "スクイックリンα",
  "スプラチャージャー",
  "_14式竹筒銃_甲",
  "ヒーローチャージャーレプリカ",
  "スクイックリンγ",
  "_14式竹筒銃_丙",
  "スクイックリンβ",
  "_14式竹筒銃_乙",
  "ソイチューバー",
  "スプラチャージャーコラボ",
  "スプラスコープコラボ",
  "リッター4K",
  "_4Kスコープ",
  "リッター4kカスタム",
  "_4kスコープカスタム",
  "ソイチューバーカスタム",
  "スプラチャージャーベッチュー",
  "スプラスコープベッチュー",
  "ノヴァブラスターネオ",
  "ロングブラスターカスタム",
  "ホットブラスターカスタム",
  "ノヴァブラスター",
  "ラピッドブラスター",
  "ロングブラスターネクロ",
  "ホットブラスター",
  "Rブラスターエリートデコ",
  "Rブラスターエリート",
  "ラピッドブラスターデコ",
  "ロングブラスター",
  "クラッシュブラスター",
  "ヒーローブラスターレプリカ",
  "クラッシュブラスターネオ",
  "ノヴァブラスターベッチュー",
  "ラピッドブラスターベッチュー",
  "ダイナモローラー",
  "スプラローラーコラボ",
  "カーボンローラー",
  "ダイナモローラーテスラ",
  "スプラローラー",
  "カーボンローラーデコ",
  "ヒーローローラーレプリカ",
  "ヴァリアブルローラー",
  "ヴァリアブルローラーフォイル",
  "スプラローラーベッチュー",
  "ダイナモローラーベッチュー",
  "ホクサイ",
  "パブロ",
  "ホクサイ_ヒュー",
  "パーマネント_パブロ",
  "パブロ_ヒュー",
  "ヒーローブラシレプリカ",
  "ホクサイベッチュー",
  "バケットスロッシャー",
  "ヒッセン",
  "スクリュースロッシャー",
  "バケットスロッシャーデコ",
  "バケットスロッシャーソーダ",
  "ヒッセン_ヒュー",
  "スクリュースロッシャーネオ",
  "ヒーロースロッシャーレプリカ",
  "エクスプロッシャー",
  "オーバーフロッシャー",
  "スクリュースロッシャーベッチュー",
  "エクスプロッシャーカスタム",
  "オーバーフロッシャーデコ",
  "スプラスピナーコラボ",
  "バレルスピナーデコ",
  "ハイドラントカスタム",
  "バレルスピナー",
  "バレルスピナーリミックス",
  "ハイドラント",
  "スプラスピナー",
  "ヒーロースピナーレプリカ",
  "クーゲルシュライバー",
  "ノーチラス47",
  "クーゲルシュライバー_ヒュー",
  "ノーチラス79",
  "スプラスピナーベッチュー",
  "パラシェルター",
  "ヒーローシェルターレプリカ",
  "キャンピングシェルター",
  "スパイガジェット",
  "パラシェルターソレーラ",
  "スパイガジェットソレーラ",
  "キャンピングシェルターソレーラ",
  "スパイガジェットベッチュー",
  "キャンピングシェルターカーモ",
];

export const getRuleName = (ruleId: number) => rules[ruleId]
export const getstageName = (stageId: number) => stages[stageId]
export const getWeaponName = (weaponId: number) => weapons[weaponId]

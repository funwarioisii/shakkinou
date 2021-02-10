
import { AccumulateItem, History, Shakkinou, ShakkinouConnector } from './types';


// contextを知っているのはShakkinouAppだが、使っているのはShakkinouConnectorになる
// テスタビリティを保ったままいい感じにしたい
export class ShakkinouApp implements Shakkinou {
  constructor(private connector: ShakkinouConnector) {}

  showHistories = (historySize: number): Promise<History[]> => {
    return this.connector.fetchHistories().then((histories) => {
      if (historySize) {
        return histories.sort((a, b) => (b.time - a.time)).slice(histories.length - historySize)
      } else {
        return histories.sort((a, b) => (b.time - a.time))
      }
    })
  }
  createHistory = (history: History): Promise<boolean> => {
    return this.connector.createHistory(history);
  }

  accumulate = async (): Promise<AccumulateItem[]> => {
    const defaultItems: AccumulateItem[] = []
    const matchCondition = (item: AccumulateItem, history: History) => (this.nameConverter(item.fromName) === this.nameConverter(history.fromName) && this.nameConverter(item.toName) === this.nameConverter(history.toName))
    return this.connector
      .fetchHistories()
      .then((histories) => {
        return histories.reduce((acc, cur) => {
          const price = Number(cur.price);
          const toName = this.nameConverter(cur.toName)
          const fromName = this.nameConverter(cur.fromName);
          const accumulateItem = acc.find((item) => matchCondition(item, cur));
          
          if (!accumulateItem) {
            const item: AccumulateItem = { fromName, toName, price } as const;
            console.log(fromName, toName, cur.time)
            acc.push(item);
          } else {
            accumulateItem.price += price;
          }
          return acc;
        }, defaultItems)
      })
      .catch((err) => { throw err })
  }

  nameConverter = (name: string) => {
    return name.match(/:\w{1,2000}:/) ? name : `:${name}:`
  }
}

import { ShakkinouApp } from '../../src/lib/shakkinou/main'
import { ShakkinouConnector, History } from '../../src/lib/shakkinou/types';

class MockShakkinouConnector implements ShakkinouConnector {
  fetchHistories(): Promise<History[]> {
    return new Promise((resolve, reject) => {
      return [
        {fromName: "monica", toName: "djenomo", price: 100, time: 10000},
        {fromName: "monica", toName: "djenomo", price: 300, time: 10001},
        {fromName: "djenomo", toName: "monica", price: 500, time: 10002},
        {fromName: "djenomo", toName: "monica", price: 700, time: 10003},
      ]})
  };
  createHistory(_: History): Promise<boolean> {
    return new Promise((resolve, reject) => true);
  };
}

describe("ShakkinouApp", () => {
  describe("showHistories", ()=>{
    const mockConnector = new MockShakkinouConnector();
    const shakkinouApp = new ShakkinouApp(mockConnector);
    it('should return expected histories', () => {
      shakkinouApp.showHistories(4).then((histories) => {
        expect(histories.length).toEqual(4)
      });

      shakkinouApp.showHistories(2).then((histories) => {
        expect(histories.length).toEqual(2)
      })
    });

    it('should return under requested size histories', () => {
      shakkinouApp.showHistories(20).then((histories) => {
        expect(histories.length).toEqual(4)
      });
    });
  });

  describe("accumulate", () => {
    it('return expected histories', () => {
      const mockConnector = new MockShakkinouConnector();
      const shakkinouApp = new ShakkinouApp(mockConnector);
      shakkinouApp.accumulate().then((items) => {
        expect(items).toStrictEqual([
          {fromName: ":monica:", toName: ":djenomo:", price: 400},
          {fromName: ":djenomo:", toName: ":monica:", price: 1200}
        ]);      
      });
    });


    it('return expected histories in complex situation', () => {
      const mockConnector = new MockShakkinouConnector();
      // const complexHistories: History[] = [
      //   { fromName: "monica", toName: "djenomo", price: 100, time: 10000, description: null },
      //   { fromName: ":monica:", toName: ":djenomo:", price: 300, time: 10001, description: null },
      //   { fromName: "djenomo", toName: "monica", price: 500, time: 10002, description: null },
      //   { fromName: ":djenomo", toName: "monica:", price: 700, time: 10003, description: null },
      // ]
      // mockConnector.fetchHistories = (() => new Promise<History[]>((res, rej) => complexHistories));
      const shakkinouApp = new ShakkinouApp(mockConnector);
      return expect(shakkinouApp.accumulate()).resolves.toStrictEqual([
        {fromName: "monica", toName: "djenomo", price: 400},
        {fromName: "djenomo", toName: "monica", price: 1200}
      ])
    });
  });

  describe("createHistory", () => {
    const mockConnector = new MockShakkinouConnector();
    const shakkinouApp = new ShakkinouApp(mockConnector);
    it('should return true', () => {
      const history = {fromName: "monica", toName: "djenomo", price: 1000, description: "foo", time: 2000 } as History
      shakkinouApp
        .createHistory(history)
        .then((result) => { expect(result).toBe(true);} )
    })
  });
});

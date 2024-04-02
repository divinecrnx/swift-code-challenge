import { Request, Response } from "express";
import csv from "csv-parser";
import fs from "fs";
import { Decimal } from "decimal.js";
import { differenceInDays, parse } from "date-fns";


const extendData = (data: any) => {

  let latestShippingDate = parse(data.latest_ship_date, "dd/MM/yyyy", new Date());

  let daysOverdue = differenceInDays(latestShippingDate, new Date());

  let itemCount = new Decimal(data.items);
  let orderValue = new Decimal(data.orderValue);
  let taxRate = new Decimal(data.taxes);

  let orderValueTotal: Decimal = itemCount.times(orderValue);
  let tax: Decimal = orderValueTotal.times(taxRate.dividedBy(new Decimal('100.0')));

  let orderTotal = orderValueTotal.plus(tax).toFixed(2, Decimal.ROUND_HALF_UP);

  let newData = {
    '_tax': tax,
    '_orderValueTotal': orderValueTotal,
    'daysOverdue': daysOverdue,
    'orderTotal': orderTotal
  };

  return {...data, ...newData}
}

export const getOrders = async () => {
  const orders: any = [];

  await new Promise((resolve: any, reject: any) => {
    fs.createReadStream("./data/orders.csv")
      .pipe(csv())
      .on("data", (data: any) => {
        let newData = extendData(data);
        orders.push(newData);
      })
      .on("end", () => resolve());
  });

  return orders;
};

export const getStores = async () => {
  const stores: any = [];

  await new Promise((resolve: any, reject: any) => {
    fs.createReadStream("./data/stores.csv")
      .pipe(csv())
      .on("data", (data: any) => stores.push(data))
      .on("end", () => resolve());
  });

  return stores;
};

export const getSales = async (req: Request, res: Response) => {
  try {
    const orders = await getOrders();
    const stores = await getStores();

    if (!orders?.length) {
      return res.send({
        orders: [],
      });
    }

    const paddedOrders = stores?.length
      ? orders.map((order: any) => ({
          ...order,
          store: stores.find((store: any) => store.storeId === order.storeId),
        }))
      : orders;

    return res.json({
      orders: paddedOrders,
    });
  } catch (error) {
    console.log("--------Failed to getSales.", error);
    return res.status(500).json("Internal Server Error");
  }
};

export const getSalesStats = async (req: Request, res: Response) => {
  const orders = await getOrders();

  let subTotal = new Decimal('0.0')
  let taxTotal = new Decimal('0.0')

  orders.map((order: any) => {
    subTotal = subTotal.plus(order._orderValueTotal);
    taxTotal = taxTotal.plus(order._tax);
  });

  let total = subTotal.plus(taxTotal);

  return res.json({
    stats: {
      'subTotal': subTotal.toFixed(2, Decimal.ROUND_HALF_UP),
      'taxTotal': taxTotal.toFixed(2, Decimal.ROUND_HALF_UP),
      'total': total.toFixed(2, Decimal.ROUND_HALF_UP)
    }
  })
}
